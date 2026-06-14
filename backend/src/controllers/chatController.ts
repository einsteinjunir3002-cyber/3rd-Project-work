import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import ChatMessage from '../models/ChatMessage';
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
}

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { recipientId, groupId } = req.query;

  if (!userId) return res.status(401).json({ message: 'Unauthorized.' });

  try {
    let filter = {};

    if (groupId) {
      filter = { groupId: groupId as string };
    } else if (recipientId) {
      filter = {
        $or: [
          { senderId: userId, recipientId: recipientId as string },
          { senderId: recipientId as string, recipientId: userId },
        ],
      };
    } else {
      return res.status(400).json({ message: 'Either recipientId or groupId must be provided.' });
    }

    const messages = await ChatMessage.find(filter)
      .populate('senderId', 'name role')
      .sort({ createdAt: 1 });

    const mapped = messages.map((m) => {
      const sender = m.senderId as any;
      return {
        id: m._id.toString(),
        senderId: m.senderId._id.toString(),
        senderName: sender ? sender.name : 'Unknown User',
        senderRole: sender ? sender.role : 'student',
        recipientId: m.recipientId?.toString(),
        groupId: m.groupId,
        message: m.message,
        fileUrl: m.fileUrl,
        fileName: m.fileName,
        read: m.read,
        createdAt: m.createdAt,
      };
    });

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getMessages error:', err);
    return res.status(500).json({ message: 'Internal server error fetching chat messages.' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  const senderId = req.user?.id;
  const { recipientId, groupId, message } = req.body;

  if (!senderId) return res.status(401).json({ message: 'Unauthorized.' });
  if (!message && !req.file) {
    return res.status(400).json({ message: 'Message text or attachment file is required.' });
  }

  try {
    let fileUrl = '';
    let fileName = '';

    if (req.file) {
      fileName = req.file.originalname;
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: 'auto',
          folder: 'smartlearn/chat',
        });
        fileUrl = result.secure_url;
        fs.unlinkSync(req.file.path);
      } else {
        fileUrl = `/uploads/${req.file.filename}`;
      }
    }

    const chatMsg = new ChatMessage({
      senderId,
      recipientId: recipientId || undefined,
      groupId: groupId || undefined,
      message: message || '',
      fileUrl: fileUrl || undefined,
      fileName: fileName || undefined,
    });

    await chatMsg.save();

    const populatedMsg = await ChatMessage.findById(chatMsg._id).populate('senderId', 'name role');
    const sender = populatedMsg?.senderId as any;

    return res.status(201).json({
      message: 'Message sent!',
      chatMessage: {
        id: chatMsg._id.toString(),
        senderId: chatMsg.senderId.toString(),
        senderName: sender ? sender.name : 'Unknown User',
        senderRole: sender ? sender.role : 'student',
        recipientId: chatMsg.recipientId?.toString(),
        groupId: chatMsg.groupId,
        message: chatMsg.message,
        fileUrl: chatMsg.fileUrl,
        fileName: chatMsg.fileName,
        read: chatMsg.read,
        createdAt: chatMsg.createdAt,
      },
    });
  } catch (err) {
    console.error('sendMessage error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({ message: 'Internal server error sending message.' });
  }
};

export const markRead = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;
  const { senderId } = req.body;

  if (!userId || !senderId) return res.status(400).json({ message: 'Missing parameters.' });

  try {
    await ChatMessage.updateMany(
      { senderId, recipientId: userId, read: false },
      { $set: { read: true } }
    );

    return res.status(200).json({ message: 'Messages marked as read.' });
  } catch (err) {
    console.error('markRead error:', err);
    return res.status(500).json({ message: 'Internal server error updating read status.' });
  }
};
