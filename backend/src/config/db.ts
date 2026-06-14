import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import University from '../models/University';
import { ghanaUniversities } from './universitySeedData';

dotenv.config();

let isDbOnline = false;
let mongoServer: any = null;

const autoSeedIfEmpty = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Auto-seeding default accounts...');
      
      const defaultPassword = 'password';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);
      const adminPasswordHash = await bcrypt.hash(defaultPassword, 10);

      // Create Admin
      const adminUser = new User({
        name: 'SmartLearn Administrator',
        email: 'sam@smartlearning.com',
        passwordHash: adminPasswordHash,
        role: 'admin'
      });
      await adminUser.save();

      // Create Student
      const studentUser = new User({
        name: 'Kofi Mensah',
        email: 'stu@smartlearn.edu',
        passwordHash,
        role: 'student',
        studentIdNumber: 'SL-10984920',
        department: 'Computer Science',
        yearOfStudy: 2,
        projectedGpa: 3.82,
        stressLevel: 25
      });
      await studentUser.save();

      // Create Lecturer
      const lecturerUser = new User({
        name: 'Mr. Emmanuel Osei',
        email: 'lec@smartlearn.edu',
        passwordHash,
        role: 'lecturer',
        title: 'Mr.',
        department: 'Computer Science',
        office: 'Block C, Office 4'
      });
      await lecturerUser.save();

      console.log('✅ Auto-seeding default accounts completed.');
    }

    const universityCount = await University.countDocuments();
    if (universityCount === 0) {
      console.log('🌱 Database is empty of universities. Seeding top 30 Ghana universities...');
      await University.insertMany(ghanaUniversities);
      console.log('✅ Seeding top 30 Ghana universities completed.');
    }
  } catch (err) {
    console.error('⚠️ Failed to auto-seed database:', err);
  }
};

export const connectDB = async (): Promise<void> => {
  let mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    if (process.env.NODE_ENV === 'test') {
      console.log('🧪 Test environment detected. Spinning up in-memory MongoDB directly...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        mongoURI = mongoServer.getUri();
        console.log(`🚀 In-Memory MongoDB engine successfully activated: ${mongoURI}`);
      } catch (memErr) {
        console.error('❌ Failed to start in-memory MongoDB engine:', memErr);
        isDbOnline = false;
        return;
      }
    } else {
      const defaultURI = 'mongodb://127.0.0.1:27017/smartlearn';
      try {
        mongoose.set('strictQuery', true);
        await mongoose.connect(defaultURI, { serverSelectionTimeoutMS: 2000 });
        isDbOnline = true;
        console.log('✅ Connected to local MongoDB instance on port 27017.');
        await autoSeedIfEmpty();
        return;
      } catch (err) {
        console.warn('⚠️  Local MongoDB not found on port 27017. Spinning up in-memory MongoDB fallback...');
        try {
          const { MongoMemoryServer } = require('mongodb-memory-server');
          mongoServer = await MongoMemoryServer.create();
          mongoURI = mongoServer.getUri();
          console.log(`🚀 In-Memory MongoDB engine successfully activated: ${mongoURI}`);
        } catch (memErr) {
          console.error('❌ Failed to start in-memory MongoDB engine:', memErr);
          isDbOnline = false;
          return;
        }
      }
    }
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoURI!);
    isDbOnline = true;
    console.log('✅ MongoDB connected successfully to database instance.');
    await autoSeedIfEmpty();
  } catch (err) {
    console.error('⚠️  Failed to connect to MongoDB database:', err);
    isDbOnline = false;
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('🔌 In-Memory MongoDB engine shut down.');
    }
  } catch (err) {
    console.error('Error closing database connections:', err);
  }
};

export { isDbOnline };
