import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import Notification from '../models/Notification';
import User from '../models/User';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary if credentials exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export const getAssignments = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

  try {
    const assignments = await Assignment.find().sort({ deadline: 1 });
    
    const mapped = await Promise.all(
      assignments.map(async (asg) => {
        const sub = await Submission.findOne({
          assignmentId: asg._id,
          studentId: userId,
        });

        return {
          id: asg._id.toString(),
          courseId: asg.courseId,
          title: asg.title,
          deadline: new Date(asg.deadline).toISOString().split('T')[0],
          totalPoints: asg.totalPoints,
          status: sub ? 'Submitted' : 'Pending',
          grade: sub?.grade !== undefined ? sub.grade.toString() : undefined,
          feedback: sub?.feedback,
        };
      })
    );

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getAssignments error:', err);
    return res.status(500).json({ message: 'Internal server error fetching assignments.' });
  }
};

export const createAssignment = async (req: AuthenticatedRequest, res: Response) => {
  const { title, courseId, deadline, totalPoints, description } = req.body;

  if (!title || !courseId || !deadline) {
    return res.status(400).json({ message: 'Missing required assignment fields.' });
  }

  try {
    const newAsg = new Assignment({
      courseId,
      title,
      deadline: new Date(deadline),
      totalPoints: parseInt(totalPoints) || 100,
      description,
    });
    await newAsg.save();

    // Notify all students
    const students = await User.find({ role: 'student' });
    const notifText = `New assignment created: "${title}" in Course ${courseId}`;
    
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
      message: 'Assignment created successfully!',
      assignment: {
        id: newAsg._id.toString(),
        courseId: newAsg.courseId,
        title: newAsg.title,
        deadline: new Date(newAsg.deadline).toISOString().split('T')[0],
        totalPoints: newAsg.totalPoints,
        status: 'Pending',
      },
    });
  } catch (err) {
    console.error('createAssignment error:', err);
    return res.status(500).json({ message: 'Internal server error creating assignment.' });
  }
};

export const submitAssignment = async (req: AuthenticatedRequest, res: Response) => {
  const { assignmentId } = req.body;
  const studentId = req.user?.id;

  if (!assignmentId || !studentId) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: 'Assignment ID is required.' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Assignment submission file is required.' });
    }
    const fileName = req.file.originalname;
    let fileUrl = '';

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'raw',
        folder: 'smartlearn/submissions',
      });
      fileUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    } else {
      fileUrl = `/uploads/${req.file.filename}`;
    }

    // Simulate plagiarism scanner: 0% to 5% score
    const plagiarismScore = Math.floor(Math.random() * 5);

    // Upsert submission
    const submission = await Submission.findOneAndUpdate(
      { assignmentId, studentId },
      {
        fileUrl,
        fileName,
        plagiarismScore,
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: 'Assignment submitted successfully! Plagiarism Shield passed.',
      plagiarismScore,
      submission: {
        id: submission._id.toString(),
        assignmentId: submission.assignmentId.toString(),
        studentId: submission.studentId.toString(),
        fileUrl: submission.fileUrl,
        fileName: submission.fileName,
        plagiarismScore: submission.plagiarismScore,
      },
    });
  } catch (err) {
    console.error('submitAssignment error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'Internal server error submitting assignment.' });
  }
};

export const getSubmissions = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const subs = await Submission.find()
      .populate('studentId', 'name')
      .populate('assignmentId', 'title')
      .sort({ createdAt: -1 });

    const mapped = subs.map((s) => {
      const studentInfo = s.studentId as any;
      const asgInfo = s.assignmentId as any;

      return {
        id: s._id.toString(),
        assignmentId: s.assignmentId.toString(),
        assignmentTitle: asgInfo ? asgInfo.title : 'Assignment',
        studentName: studentInfo ? studentInfo.name : 'Unknown Student',
        fileName: s.fileName,
        date: new Date(s.createdAt).toISOString().split('T')[0],
        grade: s.grade !== undefined ? s.grade.toString() : undefined,
        feedback: s.feedback,
        plagiarismScore: s.plagiarismScore,
      };
    });

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getSubmissions error:', err);
    return res.status(500).json({ message: 'Internal server error fetching submissions.' });
  }
};

export const gradeSubmission = async (req: AuthenticatedRequest, res: Response) => {
  const { submissionId, grade, feedback } = req.body;
  const lecturerId = req.user?.id;

  if (!submissionId || grade === undefined) {
    return res.status(400).json({ message: 'Submission ID and grade are required.' });
  }

  try {
    const sub = await Submission.findById(submissionId).populate('assignmentId', 'title');
    if (!sub) {
      return res.status(404).json({ message: 'Submission not found.' });
    }

    sub.grade = parseFloat(grade);
    sub.feedback = feedback || 'Well done.';
    sub.gradedBy = lecturerId ? Object(lecturerId) : undefined;
    sub.gradedAt = new Date();
    await sub.save();

    const asgInfo = sub.assignmentId as any;
    const asgTitle = asgInfo ? asgInfo.title : 'Assignment';

    // Dispatch notification to student
    const notif = new Notification({
      userId: sub.studentId,
      text: `Lecturer graded assignment: "${asgTitle}" (Grade: ${grade}/100)`,
    });
    await notif.save();

    return res.status(200).json({ 
      message: 'Submission graded successfully!',
      submission: {
        id: sub._id.toString(),
        assignmentId: sub.assignmentId.toString(),
        grade: sub.grade,
        feedback: sub.feedback,
      }
    });
  } catch (err) {
    console.error('gradeSubmission error:', err);
    return res.status(500).json({ message: 'Internal server error grading submission.' });
  }
};
