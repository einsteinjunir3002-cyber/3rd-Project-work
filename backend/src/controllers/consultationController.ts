import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import Consultation from '../models/Consultation';
import Notification from '../models/Notification';
import User from '../models/User';

export const bookConsultation = async (req: AuthenticatedRequest, res: Response) => {
  const studentId = req.user?.id;
  const { lecturerId, scheduledTime, topic, duration } = req.body;

  if (!studentId) return res.status(401).json({ message: 'Unauthorized.' });
  if (!lecturerId || !scheduledTime || !topic) {
    return res.status(400).json({ message: 'Lecturer ID, scheduled time, and topic are required.' });
  }

  try {
    // Check if lecturer exists
    const lecturer = await User.findOne({ _id: lecturerId, role: 'lecturer' });
    if (!lecturer) {
      return res.status(404).json({ message: 'Lecturer not found.' });
    }

    // Generate a WebRTC meeting room (e.g. Jitsi link)
    const roomId = `smartlearn-${studentId.substring(18)}-${lecturerId.substring(18)}-${Date.now()}`;
    const meetingLink = `https://meet.jit.si/${roomId}`;

    const consultation = new Consultation({
      studentId,
      lecturerId,
      scheduledTime: new Date(scheduledTime),
      duration: parseInt(duration) || 30, // Default 30 mins
      topic,
      meetingLink,
    });

    await consultation.save();

    // Notify Lecturer
    const student = await User.findById(studentId);
    const notif = new Notification({
      userId: lecturerId,
      text: `New consultation booking request from student "${student ? student.name : 'Student'}" regarding "${topic}"`,
    });
    await notif.save();

    return res.status(201).json({
      message: 'Consultation booked successfully!',
      consultation,
    });
  } catch (err) {
    console.error('bookConsultation error:', err);
    return res.status(500).json({ message: 'Internal server error booking consultation.' });
  }
};

export const getConsultations = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

  try {
    const filter: any = userRole === 'student' ? { studentId: userId } : { lecturerId: userId };
    
    const consultations = await Consultation.find(filter)
      .populate('studentId', 'name email')
      .populate('lecturerId', 'name title office')
      .sort({ scheduledTime: 1 });

    const mapped = consultations.map((c) => {
      const studentInfo = c.studentId as any;
      const lecturerInfo = c.lecturerId as any;

      return {
        id: c._id.toString(),
        topic: c.topic,
        scheduledTime: c.scheduledTime,
        duration: c.duration,
        meetingLink: c.meetingLink,
        status: c.status,
        studentName: studentInfo ? studentInfo.name : 'Unknown Student',
        lecturerName: lecturerInfo ? `${lecturerInfo.title || 'Dr.'} ${lecturerInfo.name}` : 'Staff',
        office: lecturerInfo ? lecturerInfo.office : undefined,
      };
    });

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getConsultations error:', err);
    return res.status(500).json({ message: 'Internal server error fetching consultations.' });
  }
};

export const updateStatus = async (req: AuthenticatedRequest, res: Response) => {
  const { consultationId, status } = req.body;
  const userId = req.user?.id;

  if (!consultationId || !status) {
    return res.status(400).json({ message: 'Consultation ID and status are required.' });
  }

  if (!['Scheduled', 'Completed', 'Cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({ message: 'Consultation booking not found.' });
    }

    // Verify user owns/is part of this consultation
    if (
      consultation.studentId.toString() !== userId &&
      consultation.lecturerId.toString() !== userId &&
      req.user?.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    consultation.status = status;
    await consultation.save();

    // Notify the other party
    const isLecturer = req.user?.role === 'lecturer';
    const targetUserId = isLecturer ? consultation.studentId : consultation.lecturerId;
    const senderName = req.user?.name || 'User';

    const notif = new Notification({
      userId: targetUserId,
      text: `Consultation regarding "${consultation.topic}" has been updated to "${status}" by ${senderName}.`,
    });
    await notif.save();

    return res.status(200).json({ message: `Consultation status updated to ${status}.`, consultation });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ message: 'Internal server error updating consultation.' });
  }
};
