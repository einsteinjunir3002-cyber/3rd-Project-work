import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultation extends Document {
  lecturerId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  scheduledTime: Date;
  duration: number; // in minutes
  topic: string;
  meetingLink: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const ConsultationSchema: Schema = new Schema(
  {
    lecturerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledTime: { type: Date, required: true },
    duration: { type: Number, required: true, default: 30 }, // 30 minutes
    topic: { type: String, required: true, trim: true },
    meetingLink: { type: String, required: true },
    status: { type: String, required: true, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
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

export default mongoose.model<IConsultation>('Consultation', ConsultationSchema);
