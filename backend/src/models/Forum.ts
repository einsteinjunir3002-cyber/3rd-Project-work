import mongoose, { Schema, Document } from 'mongoose';

export interface IForumThread extends Document {
  category: string; // e.g. 'Computer Science', 'Business'
  authorId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  upvotes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IForumReply extends Document {
  threadId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const ForumThreadSchema: Schema = new Schema(
  {
    category: { type: String, required: true, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
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

const ForumReplySchema: Schema = new Schema(
  {
    threadId: { type: Schema.Types.ObjectId, ref: 'ForumThread', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    body: { type: String, required: true },
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

export const ForumThread = mongoose.model<IForumThread>('ForumThread', ForumThreadSchema);
export const ForumReply = mongoose.model<IForumReply>('ForumReply', ForumReplySchema);
