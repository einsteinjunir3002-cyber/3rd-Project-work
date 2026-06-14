import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAnswer {
  questionId: mongoose.Types.ObjectId;
  studentAnswer: string;
  score?: number; // score for this specific answer
}

export interface IQuizAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  answers: IQuizAnswer[];
  finalScore: number;
  graded: boolean;
  feedback?: string;
  gradedBy?: mongoose.Types.ObjectId;
  gradedAt?: Date;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAnswerSchema = new Schema({
  questionId: { type: Schema.Types.ObjectId, required: true },
  studentAnswer: { type: String, required: true },
  score: { type: Number, default: 0 },
});

const QuizAttemptSchema: Schema = new Schema(
  {
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [QuizAnswerSchema],
    finalScore: { type: Number, required: true, default: 0 },
    graded: { type: Boolean, required: true, default: false },
    feedback: { type: String },
    gradedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    gradedAt: { type: Date },
    completedAt: { type: Date, default: Date.now },
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

export default mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
