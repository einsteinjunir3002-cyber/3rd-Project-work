import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document {
  name: string;
  ranking: number;
  image: string;
  type: 'Public' | 'Private';
  location: string;
  established: number;
  academicsInfo: string;
  performanceReview: string;
  feesRange: string;
  scholarshipsInfo: string;
  programsOffered: string[];
  admissionRequirements: string;
  createdAt: Date;
  updatedAt: Date;
}

const UniversitySchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    ranking: { type: Number, required: true },
    image: { type: String, required: true },
    type: { type: String, enum: ['Public', 'Private'], required: true },
    location: { type: String, required: true, trim: true },
    established: { type: Number, required: true },
    academicsInfo: { type: String, required: true },
    performanceReview: { type: String, required: true },
    feesRange: { type: String, required: true },
    scholarshipsInfo: { type: String, required: true },
    programsOffered: [{ type: String }],
    admissionRequirements: { type: String, required: true }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<IUniversity>('University', UniversitySchema);
