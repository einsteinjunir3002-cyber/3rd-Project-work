import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Course from '../models/Course';
import Note from '../models/Note';
import Assignment from '../models/Assignment';
import User from '../models/User';
import Notification from '../models/Notification';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary if credentials exist
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('✅ Cloudinary client initialized for course materials.');
}

export const getCourses = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const courses = await Course.find().populate('lecturer', 'name title');
    
    const mappedCourses = await Promise.all(
      courses.map(async (course) => {
        const notesCount = await Note.countDocuments({ courseId: course._id });
        const assignmentsCount = await Assignment.countDocuments({ courseId: course._id });
        
        const lecturerInfo = course.lecturer as any;
        const instructorName = lecturerInfo 
          ? `${lecturerInfo.title || 'Dr.'} ${lecturerInfo.name}` 
          : 'Staff';

        return {
          id: course._id,
          code: course.code,
          title: course.title,
          instructor: instructorName,
          instructorId: lecturerInfo ? lecturerInfo._id.toString() : '',
          avatar: 'avatar_lecturer.jpg',
          notesCount,
          assignmentsCount,
          description: course.description,
        };
      })
    );

    return res.status(200).json(mappedCourses);
  } catch (err) {
    console.error('getCourses error:', err);
    return res.status(500).json({ message: 'Internal server error fetching courses.' });
  }
};

export const getNotes = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });
    const mapped = notes.map((n) => ({
      id: n._id.toString(),
      courseId: n.courseId,
      title: n.title,
      date: new Date(n.createdAt).toISOString().split('T')[0],
      size: n.fileSize,
      fileUrl: n.fileUrl,
    }));
    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getNotes error:', err);
    return res.status(500).json({ message: 'Internal server error fetching notes.' });
  }
};

export const uploadNote = async (req: AuthenticatedRequest, res: Response) => {
  const { title, courseId } = req.body;
  const lecturerId = req.user?.id;

  if (!title || !courseId) {
    // Cleanup uploaded file if request validation fails
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: 'Title and course ID are required.' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Lecture note file upload is required.' });
    }

    let fileUrl = '';
    const fileName = req.file.originalname;
    const fileSize = `${(req.file.size / (1024 * 1024)).toFixed(1)} MB`;

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'raw', // Support non-image documents (PDFs, DOCX)
        folder: 'smartlearn/notes',
      });
      fileUrl = result.secure_url;
      // Delete local temp file
      fs.unlinkSync(req.file.path);
    } else {
      // Local path URL
      fileUrl = `/uploads/${req.file.filename}`;
    }

    const newNote = new Note({
      courseId,
      title: fileName,
      fileUrl,
      fileSize,
      uploadedBy: lecturerId,
    });
    await newNote.save();

    // Notify all students enrolled or general students
    const students = await User.find({ role: 'student' });
    const notifText = `New lecture note published: "${fileName}" under Course ${courseId}`;
    
    await Promise.all(
      students.map((student) => {
        const notif = new Notification({
          userId: student._id,
          text: notifText,
        });
        return notif.save();
      })
    );

    return res.status(201).json({
      message: 'Lecture note uploaded successfully!',
      note: {
        id: newNote._id.toString(),
        courseId: newNote.courseId,
        title: newNote.title,
        date: new Date(newNote.createdAt).toISOString().split('T')[0],
        size: newNote.fileSize,
        fileUrl: newNote.fileUrl,
      },
    });
  } catch (err) {
    console.error('uploadNote error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'Internal server error uploading note.' });
  }
};

export const getStudents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email studentIdNumber department projectedGpa');
    const mapped = students.map((s) => ({
      id: s._id.toString(),
      name: s.name,
      email: s.email,
      studentIdNumber: s.studentIdNumber,
      department: s.department,
      projectedGpa: s.projectedGpa || 4.0,
    }));
    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getStudents error:', err);
    return res.status(500).json({ message: 'Internal server error fetching students.' });
  }
};
