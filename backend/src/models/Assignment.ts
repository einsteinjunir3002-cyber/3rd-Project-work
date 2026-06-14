import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  courseId: string; // references Course._id
  title: string;
  deadline: Date;
  totalPoints: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    courseId: { type: String, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    deadline: { type: Date, required: true },
    totalPoints: { type: Number, required: true, default: 100 },
    description: { type: String },
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

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
