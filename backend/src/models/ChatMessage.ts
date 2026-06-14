import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  recipientId?: mongoose.Types.ObjectId; // For private 1-to-1 chats
  groupId?: string; // For group chat channels
  message: string;
  fileUrl?: string; // Optional file sharing attachment
  fileName?: string;
  read: boolean;
  createdAt: Date;
}

const ChatMessageSchema: Schema = new Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    groupId: { type: String, trim: true },
    message: { type: String, required: true },
    fileUrl: { type: String },
    fileName: { type: String },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

// Add index for fast querying of chats
ChatMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: 1 });
ChatMessageSchema.index({ groupId: 1, createdAt: 1 });

export default mongoose.model<IChatMessage>('ChatMessage', ChatMessageSchema);
