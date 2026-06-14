import mongoose, { Schema, Document } from 'mongoose';

// Startup Incubator Program & Startup Profile
export interface IStartupProgram extends Document {
  name: string;
  description: string;
  startDate?: Date;
  status: 'active' | 'completed' | 'upcoming';
}
const StartupProgramSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  startDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'upcoming'], default: 'upcoming' }
}, { timestamps: true });

export const StartupProgram = mongoose.model<IStartupProgram>('StartupProgram', StartupProgramSchema);

// Research Project
export interface IResearchProject extends Document {
  title: string;
  domain: string;
  leadResearcher?: mongoose.Types.ObjectId;
  fundingAmount?: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
}
const ResearchProjectSchema = new Schema({
  title: { type: String, required: true },
  domain: { type: String, required: true },
  leadResearcher: { type: Schema.Types.ObjectId, ref: 'User' },
  fundingAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'rejected'], default: 'pending' }
}, { timestamps: true });

export const ResearchProject = mongoose.model<IResearchProject>('ResearchProject', ResearchProjectSchema);

// Career Listing
export interface IJobListing extends Document {
  title: string;
  company: string;
  location: string;
  type: 'Internship' | 'Full-time' | 'NSP' | 'Part-time';
  description?: string;
  link?: string;
}
const JobListingSchema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  type: { type: String, enum: ['Internship', 'Full-time', 'NSP', 'Part-time'], default: 'Full-time' },
  description: { type: String },
  link: { type: String }
}, { timestamps: true });

export const JobListing = mongoose.model<IJobListing>('JobListing', JobListingSchema);
