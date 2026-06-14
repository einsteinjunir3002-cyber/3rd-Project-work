import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizQuestion {
  _id?: mongoose.Types.ObjectId;
  questionText: string;
  questionType: 'MCQ' | 'True/False' | 'Essay' | 'Coding';
  options?: string[]; // Used for MCQ
  correctAnswer: string; // Used for auto-grading MCQs/True-False, or as a reference for Lecturers
}

export interface IQuiz extends Document {
  courseId: string; // references Course._id
  title: string;
  description?: string;
  timeLimit: number; // in minutes
  questions: IQuizQuestion[];
  totalPoints: number;
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema({
  questionText: { type: String, required: true },
  questionType: { type: String, required: true, enum: ['MCQ', 'True/False', 'Essay', 'Coding'] },
  options: [{ type: String }],
  correctAnswer: { type: String, required: true },
});

const QuizSchema: Schema = new Schema(
  {
    courseId: { type: String, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    timeLimit: { type: Number, required: true, default: 15 }, // default 15 mins
    questions: [QuizQuestionSchema],
    totalPoints: { type: Number, required: true, default: 10 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<IQuiz>('Quiz', QuizSchema);
