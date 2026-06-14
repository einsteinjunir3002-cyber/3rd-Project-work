import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'lecturer' | 'admin' | 'superadmin' | 'researcher' | 'entrepreneur' | 'alumni' | 'industry_partner' | 'career_advisor' | 'prospective_student';
  provider: string;
  providerId?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  rememberToken?: string;
  // Student Metadata
  studentIdNumber?: string;
  department?: string;
  yearOfStudy?: number;
  projectedGpa?: number;
  stressLevel?: number;
  // Lecturer Metadata
  title?: string;
  office?: string;
  // Entrepreneur Metadata
  startupName?: string;
  businessIdea?: string;
  // Researcher Metadata
  researchArea?: string;
  institution?: string;
  // Alumni & Industry Partner Metadata
  graduationYear?: string;
  companyName?: string;
  industrySector?: string;
  // Career Advisor Metadata
  advisorExpertise?: string;
  // Prospective Student Metadata
  intendedMajor?: string;
  highSchool?: string;
  isSuspended: boolean;
  biometricPublicKey?: string;
  biometricKeyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: ['student', 'lecturer', 'admin', 'superadmin', 'researcher', 'entrepreneur', 'alumni', 'industry_partner', 'career_advisor', 'prospective_student'], default: 'student' },
    isSuspended: { type: Boolean, default: false },
    provider: { type: String, required: true, default: 'local' },
    providerId: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    rememberToken: { type: String },
    
    // Biometrics fields
    biometricPublicKey: { type: String },
    biometricKeyId: { type: String },
    
    // Student fields
    studentIdNumber: { type: String, unique: true, sparse: true },
    department: { type: String },
    yearOfStudy: { type: Number, min: 1, max: 6, default: 1 },
    projectedGpa: { type: Number, min: 0.0, max: 4.0, default: 4.0 },
    stressLevel: { type: Number, min: 0, max: 100, default: 50 },

    // Lecturer fields
    title: { type: String, default: 'Dr.' },
    office: { type: String },

    // Entrepreneur fields
    startupName: { type: String },
    businessIdea: { type: String },

    // Researcher fields
    researchArea: { type: String },
    institution: { type: String },

    // Alumni fields
    graduationYear: { type: String },
    companyName: { type: String },

    // Industry Partner fields
    industrySector: { type: String },

    // Career Advisor fields
    advisorExpertise: { type: String },

    // Prospective Student fields
    intendedMajor: { type: String },
    highSchool: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Virtual for backward compatibility (studentName or similar mapping if needed)
UserSchema.virtual('idString').get(function (this: IUser) {
  return this._id.toString();
});

export default mongoose.model<IUser>('User', UserSchema);
