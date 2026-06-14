import mongoose, { Schema, Document } from 'mongoose';

// Faculty
export interface IFaculty extends Document {
  name: string;
  code: string;
}
const FacultySchema = new Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }
}, { timestamps: true });

export const Faculty = mongoose.model<IFaculty>('Faculty', FacultySchema);

// Department
export interface IDepartment extends Document {
  name: string;
  code: string;
  facultyId?: mongoose.Types.ObjectId;
}
const DepartmentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  facultyId: { type: Schema.Types.ObjectId, ref: 'Faculty' }
}, { timestamps: true });

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);

// Semester
export interface ISemester extends Document {
  name: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'upcoming';
}
const SemesterSchema = new Schema({
  name: { type: String, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'upcoming'], default: 'upcoming' }
}, { timestamps: true });

export const Semester = mongoose.model<ISemester>('Semester', SemesterSchema);

// AcademicYear
export interface IAcademicYear extends Document {
  yearName: string; // e.g. 2025/2026
  status: 'active' | 'completed' | 'upcoming';
}
const AcademicYearSchema = new Schema({
  yearName: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'completed', 'upcoming'], default: 'upcoming' }
}, { timestamps: true });

export const AcademicYear = mongoose.model<IAcademicYear>('AcademicYear', AcademicYearSchema);
