import mongoose, { Schema, Document } from 'mongoose';

export interface ICourse {
  _id: string; // e.g. 'CS101'
  code: string;
  title: string;
  lecturer?: mongoose.Types.ObjectId;
  students: mongoose.Types.ObjectId[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    _id: { type: String, required: true }, // Set custom code as _id
    code: { type: String, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    lecturer: { type: Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    description: { type: String },
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

export default mongoose.model<ICourse>('Course', CourseSchema);
