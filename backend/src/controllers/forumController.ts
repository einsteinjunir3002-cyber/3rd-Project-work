import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { ForumThread, ForumReply } from '../models/Forum';

export const getThreads = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const threads = await ForumThread.find()
      .populate('authorId', 'name role')
      .sort({ createdAt: -1 });

    const mapped = await Promise.all(
      threads.map(async (t) => {
        const replies = await ForumReply.find({ threadId: t._id })
          .populate('authorId', 'name role')
          .sort({ createdAt: 1 });

        const authorInfo = t.authorId as any;

        return {
          id: t._id.toString(),
          category: t.category,
          author: authorInfo ? authorInfo.name : 'Unknown User',
          avatar: authorInfo?.role === 'student' ? 'avatar_student.jpg' : 'avatar_lecturer.jpg',
          title: t.title,
          body: t.body,
          upvotes: t.upvotes,
          replies: replies.map((r) => {
            const replyAuthor = r.authorId as any;
            return {
              author: replyAuthor ? replyAuthor.name : 'Unknown User',
              avatar: replyAuthor?.role === 'student' ? 'avatar_student.jpg' : 'avatar_lecturer.jpg',
              role: replyAuthor?.role === 'student' ? 'Student' : 'Lecturer',
              body: r.body,
            };
          }),
        };
      })
    );

    return res.status(200).json(mapped);
  } catch (err) {
    console.error('getThreads error:', err);
    return res.status(500).json({ message: 'Internal server error fetching discussion threads.' });
  }
};

export const createThread = async (req: AuthenticatedRequest, res: Response) => {
  const { category, title, body } = req.body;
  const authorId = req.user?.id;
  const authorName = req.user?.name || 'Kofi Mensah';
  const authorRole = req.user?.role || 'student';

  if (!category || !title || !body) {
    return res.status(400).json({ message: 'Category, title, and body are required.' });
  }

  try {
    const thread = new ForumThread({
      category,
      authorId,
      title,
      body,
    });
    await thread.save();

    return res.status(201).json({
      message: 'Discussion thread created successfully!',
      thread: {
        id: thread._id.toString(),
        category,
        author: authorName,
        avatar: authorRole === 'student' ? 'avatar_student.jpg' : 'avatar_lecturer.jpg',
        title,
        body,
        upvotes: 0,
        replies: [],
      },
    });
  } catch (err) {
    console.error('createThread error:', err);
    return res.status(500).json({ message: 'Internal server error creating discussion thread.' });
  }
};

export const createReply = async (req: AuthenticatedRequest, res: Response) => {
  const { threadId, body } = req.body;
  const authorId = req.user?.id;
  const authorName = req.user?.name || 'Kofi Mensah';
  const authorRole = req.user?.role || 'student';

  if (!threadId || !body) {
    return res.status(400).json({ message: 'Thread ID and body are required.' });
  }

  try {
    const reply = new ForumReply({
      threadId,
      authorId,
      body,
    });
    await reply.save();

    return res.status(201).json({
      message: 'Reply submitted successfully!',
      reply: {
        author: authorName,
        avatar: authorRole === 'student' ? 'avatar_student.jpg' : 'avatar_lecturer.jpg',
        role: authorRole === 'student' ? 'Student' : 'Lecturer',
        body,
      },
    });
  } catch (err) {
    console.error('createReply error:', err);
    return res.status(500).json({ message: 'Internal server error submitting reply.' });
  }
};

export const upvoteThread = async (req: AuthenticatedRequest, res: Response) => {
  const { threadId } = req.params;

  try {
    const thread = await ForumThread.findByIdAndUpdate(
      threadId,
      { $inc: { upvotes: 1 } },
      { new: true }
    );

    if (!thread) {
      return res.status(404).json({ message: 'Forum thread not found.' });
    }

    return res.status(200).json({ message: 'Upvoted successfully!', upvotes: thread.upvotes });
  } catch (err) {
    console.error('upvoteThread error:', err);
    return res.status(500).json({ message: 'Internal server error upvoting thread.' });
  }
};
