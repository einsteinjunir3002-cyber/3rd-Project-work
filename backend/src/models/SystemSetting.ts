import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  siteName: string;
  activeAiProvider: 'gemini' | 'openai' | 'openrouter' | 'groq' | 'together';
  activeAiModel: string;
  geminiApiKey?: string;
  openaiApiKey?: string;
  openrouterApiKey?: string;
  groqApiKey?: string;
  togetherApiKey?: string;
  apiUsageStats: {
    gemini: { requests: number; errors: number };
    openai: { requests: number; errors: number };
    openrouter: { requests: number; errors: number };
    groq: { requests: number; errors: number };
    together: { requests: number; errors: number };
  };
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingSchema: Schema = new Schema(
  {
    siteName: { type: String, required: true, default: 'SmartLearn AI' },
    activeAiProvider: {
      type: String,
      required: true,
      enum: ['gemini', 'openai', 'openrouter', 'groq', 'together'],
      default: 'groq',
    },
    activeAiModel: { type: String, required: true, default: 'llama3-8b-8192' },
    geminiApiKey: { type: String, default: '' },
    openaiApiKey: { type: String, default: '' },
    openrouterApiKey: { type: String, default: '' },
    groqApiKey: { type: String, default: '' },
    togetherApiKey: { type: String, default: '' },
    apiUsageStats: {
      gemini: {
        requests: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
      },
      openai: {
        requests: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
      },
      openrouter: {
        requests: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
      },
      groq: {
        requests: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
      },
      together: {
        requests: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        // Do not expose API keys over API directly unless requested or mask them
        if (ret.geminiApiKey) ret.geminiApiKey = ret.geminiApiKey.substring(0, 6) + '...';
        if (ret.openaiApiKey) ret.openaiApiKey = ret.openaiApiKey.substring(0, 6) + '...';
        if (ret.openrouterApiKey) ret.openrouterApiKey = ret.openrouterApiKey.substring(0, 6) + '...';
        if (ret.groqApiKey) ret.groqApiKey = ret.groqApiKey.substring(0, 6) + '...';
        if (ret.togetherApiKey) ret.togetherApiKey = ret.togetherApiKey.substring(0, 6) + '...';
        return ret;
      },
    },
  }
);

export default mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
