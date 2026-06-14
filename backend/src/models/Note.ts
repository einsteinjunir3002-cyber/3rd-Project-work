import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  courseId: string; // references Course._id e.g. 'CS101'
  title: string;
  fileUrl: string;
  fileSize: string;
  uploadedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema(
  {
    courseId: { type: String, ref: 'Course', required: true },
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    fileSize: { type: String, required: true, default: '1.5 MB' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
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

export default mongoose.model<INote>('Note', NoteSchema);
