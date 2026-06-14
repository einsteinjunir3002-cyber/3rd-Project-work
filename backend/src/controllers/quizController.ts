import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Quiz from '../models/Quiz';
import QuizAttempt from '../models/QuizAttempt';
import Notification from '../models/Notification';
import User from '../models/User';
import mongoose from 'mongoose';

export const createQuiz = async (req: AuthenticatedRequest, res: Response) => {
  const { title, courseId, description, timeLimit, questions, totalPoints } = req.body;

  if (!title || !courseId || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ message: 'Title, courseId, and questions array are required.' });
  }

  try {
    const quiz = new Quiz({
      courseId,
      title,
      description,
      timeLimit: parseInt(timeLimit) || 15,
      questions,
      totalPoints: parseInt(totalPoints) || questions.length,
    });

    await quiz.save();

    // Notify students
    const students = await User.find({ role: 'student' });
    const notifText = `New quiz published: "${title}" in Course ${courseId}`;
    
    await Promise.all(
      students.map((student) => {
        const notif = new Notification({
          userId: student._id,
          text: notifText,
        });
        return notif.save();
      })
    );

    return res.status(201).json({
      message: 'Quiz created successfully!',
      quiz: {
        id: quiz._id.toString(),
        title: quiz.title,
        courseId: quiz.courseId,
        timeLimit: quiz.timeLimit,
        totalPoints: quiz.totalPoints,
      },
    });
  } catch (err) {
    console.error('createQuiz error:', err);
    return res.status(500).json({ message: 'Internal server error creating quiz.' });
  }
};

export const getQuizzes = async (req: AuthenticatedRequest, res: Response) => {
  const { courseId } = req.query;

  try {
    const filter = courseId ? { courseId: courseId as string } : {};
    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    const mapped = await Promise.all(
      quizzes.map(async (q) => {
        // If student, check if they already took this quiz
        let attempt = null;
        if (req.user?.role === 'student') {
          attempt = await QuizAttempt.findOne({ quizId: q._id, studentId: req.user.id });
        }

        return {
          id: q._id.toString(),
          courseId: q.courseId,
          title: q.title,
          description: q.description,
          timeLimit: q.timeLimit,
          totalPoints: q.totalPoints,
          questionsCount: q.questions.length,
          taken: !!attempt,
          score: attempt ? attempt.finalScore : undefined,
          graded: attempt ? attempt.graded : undefined,
        };
      })
    );

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getQuizzes error:', err);
    return res.status(500).json({ message: 'Internal server error fetching quizzes.' });
  }
};

// Gets quiz questions, but strips the correct answers for security during testing
export const getQuizDetails = async (req: AuthenticatedRequest, res: Response) => {
  const { quizId } = req.params;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Map questions, omitting correct answers if student
    const questions = quiz.questions.map((q) => {
      const qObj: any = {
        id: q._id?.toString(),
        questionText: q.questionText,
        questionType: q.questionType,
        options: q.options,
      };

      if (req.user?.role !== 'student') {
        qObj.correctAnswer = q.correctAnswer;
      }
      return qObj;
    });

    return res.status(200).json({
      id: quiz._id.toString(),
      courseId: quiz.courseId,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      totalPoints: quiz.totalPoints,
      questions,
    });
  } catch (err) {
    console.error('getQuizDetails error:', err);
    return res.status(500).json({ message: 'Internal server error retrieving quiz.' });
  }
};

export const submitQuiz = async (req: AuthenticatedRequest, res: Response) => {
  const { quizId, answers } = req.body; // answers: [{ questionId, studentAnswer }]
  const studentId = req.user?.id;

  if (!quizId || !answers || !Array.isArray(answers)) {
    return res.status(400).json({ message: 'Quiz ID and answers array are required.' });
  }

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found.' });
    }

    // Check if attempt already exists
    const existing = await QuizAttempt.findOne({ quizId, studentId });
    if (existing) {
      return res.status(400).json({ message: 'You have already attempted this quiz.' });
    }

    let finalScore = 0;
    let containsManualGrading = false;
    const gradedAnswers = [];

    // Auto-grade objective questions (MCQ, True/False)
    for (const q of quiz.questions) {
      const submitted = answers.find(
        (a) => a.questionId.toString() === q._id?.toString()
      );
      
      const studentAnswer = submitted ? submitted.studentAnswer.trim() : '';
      let score = 0;

      if (q.questionType === 'MCQ' || q.questionType === 'True/False') {
        if (studentAnswer.toLowerCase() === q.correctAnswer.toLowerCase().trim()) {
          score = 1; // 1 point per correct objective question
          finalScore += 1;
        }
      } else {
        containsManualGrading = true;
      }

      gradedAnswers.push({
        questionId: q._id,
        studentAnswer,
        score: q.questionType === 'MCQ' || q.questionType === 'True/False' ? score : undefined,
      });
    }

    const attempt = new QuizAttempt({
      quizId,
      studentId,
      answers: gradedAnswers,
      finalScore,
      graded: !containsManualGrading, // Graded if no subjective questions
    });

    await attempt.save();

    return res.status(200).json({
      message: containsManualGrading
        ? 'Quiz submitted! Objective questions graded. Awaiting instructor evaluation for essay/coding questions.'
        : 'Quiz submitted and auto-graded successfully!',
      attempt: {
        id: attempt._id.toString(),
        finalScore: attempt.finalScore,
        graded: attempt.graded,
      },
    });
  } catch (err) {
    console.error('submitQuiz error:', err);
    return res.status(500).json({ message: 'Internal server error submitting quiz attempt.' });
  }
};

export const getQuizAttempts = async (req: AuthenticatedRequest, res: Response) => {
  const { quizId } = req.query;

  try {
    const filter = quizId ? { quizId: quizId as string } : {};
    const attempts = await QuizAttempt.find(filter)
      .populate('studentId', 'name')
      .populate('quizId', 'title')
      .sort({ createdAt: -1 });

    const mapped = attempts.map((a) => {
      const studentInfo = a.studentId as any;
      const quizInfo = a.quizId as any;

      return {
        id: a._id.toString(),
        quizTitle: quizInfo ? quizInfo.title : 'Quiz',
        studentName: studentInfo ? studentInfo.name : 'Unknown Student',
        score: a.finalScore,
        graded: a.graded,
        completedAt: a.completedAt,
        answers: a.answers,
      };
    });

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getQuizAttempts error:', err);
    return res.status(500).json({ message: 'Internal server error fetching quiz attempts.' });
  }
};

export const gradeQuizAttempt = async (req: AuthenticatedRequest, res: Response) => {
  const { attemptId, questionGrades, feedback } = req.body; // questionGrades: { [questionId]: score }
  const lecturerId = req.user?.id;

  if (!attemptId || !questionGrades) {
    return res.status(400).json({ message: 'Attempt ID and question grades are required.' });
  }

  try {
    const attempt = await QuizAttempt.findById(attemptId).populate('quizId', 'title');
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found.' });
    }

    let calculatedScore = 0;
    
    // Update individual question scores
    attempt.answers.forEach((ans) => {
      const qIdStr = ans.questionId.toString();
      if (questionGrades[qIdStr] !== undefined) {
        ans.score = parseFloat(questionGrades[qIdStr]);
      }
      calculatedScore += ans.score || 0;
    });

    attempt.finalScore = calculatedScore;
    attempt.graded = true;
    attempt.feedback = feedback;
    attempt.gradedBy = lecturerId ? new mongoose.Types.ObjectId(lecturerId) : undefined;
    attempt.gradedAt = new Date();
    
    await attempt.save();

    const quizInfo = attempt.quizId as any;
    const quizTitle = quizInfo ? quizInfo.title : 'Quiz';

    // Dispatch notification
    const notif = new Notification({
      userId: attempt.studentId,
      text: `Your quiz attempt for "${quizTitle}" has been graded: (Score: ${calculatedScore} points)`,
    });
    await notif.save();

    return res.status(200).json({ message: 'Quiz attempt graded successfully!', score: calculatedScore });
  } catch (err) {
    console.error('gradeQuizAttempt error:', err);
    return res.status(500).json({ message: 'Internal server error grading quiz.' });
  }
};
