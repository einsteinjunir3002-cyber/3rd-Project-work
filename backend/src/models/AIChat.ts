import mongoose, { Schema, Document } from 'mongoose';

export interface IAIChat extends Document {
  userId: mongoose.Types.ObjectId;
  chatMode: 'study' | 'career' | 'helper' | 'tutor' | 'wellness' | 'research' | 'innovation';
  message: string;
  response: string;
  createdAt: Date;
}

const AIChatSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatMode: { 
      type: String, 
      required: true, 
      enum: ['study', 'career', 'helper', 'tutor', 'wellness', 'research', 'innovation'] 
    },
    message: { type: String, required: true },
    response: { type: String, required: true },
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

// Index chat history by user and mode for quick retrieval
AIChatSchema.index({ userId: 1, chatMode: 1, createdAt: -1 });

export default mongoose.model<IAIChat>('AIChat', AIChatSchema);
