import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail: string;
  action: string;
  ipAddress: string;
  device: string;
  previousValue: string;
  newValue: string;
  timestamp: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String, required: true },
    action: { type: String, required: true },
    ipAddress: { type: String, default: '' },
    device: { type: String, default: '' },
    previousValue: { type: String, default: '' },
    newValue: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
