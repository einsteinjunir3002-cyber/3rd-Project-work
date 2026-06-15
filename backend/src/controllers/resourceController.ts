import { Request, Response } from 'express';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const uploadResource = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const { title, description, courseId, programId, departmentId, facultyId } = req.body;
  const uploaderId = req.user.id;

  try {
    const fileUrl = `/uploads/${req.file.filename}`;
    const fileType = req.file.mimetype;
    const fileSize = (req.file.size / 1024 / 1024).toFixed(2) + ' MB';

    // Auto-approve if uploaded by lecturer/admin, else pending
    const approvalStatus = req.user.role === 'student' ? 'pending' : 'approved';

    const result = await db.query(
      `INSERT INTO resources 
        (title, description, faculty_id, department_id, program_id, course_id, file_url, file_type, file_size, version_number, approval_status, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1, $10, $11) RETURNING *`,
      [
        title, description, 
        facultyId || null, 
        departmentId || req.user.departmentId, 
        programId || null, 
        courseId || null, 
        fileUrl, fileType, fileSize, 
        approvalStatus, uploaderId
      ]
    );

    return res.status(201).json({ message: 'Resource uploaded successfully.', resource: result.rows[0] });
  } catch (err) {
    console.error('Resource upload error:', err);
    return res.status(500).json({ message: 'Internal server error during upload.' });
  }
};

export const getResources = async (req: AuthenticatedRequest, res: Response) => {
  const departmentId = req.user.departmentId;

  try {
    let query = `
      SELECT r.*, u.name as uploader_name 
      FROM resources r
      LEFT JOIN users u ON r.uploaded_by = u.id
      WHERE r.department_id = $1 AND r.approval_status = 'approved'
      ORDER BY r.created_at DESC
    `;
    const params = [departmentId];

    // Super Admins can see everything across departments if they pass a query param
    if (req.user.role === 'super_admin' && req.query.all === 'true') {
      query = `
        SELECT r.*, u.name as uploader_name 
        FROM resources r
        LEFT JOIN users u ON r.uploaded_by = u.id
        ORDER BY r.created_at DESC
      `;
      params.pop();
    }

    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch resources error:', err);
    return res.status(500).json({ message: 'Internal server error fetching resources.' });
  }
};

export const downloadResource = async (req: AuthenticatedRequest, res: Response) => {
  const resourceId = parseInt(req.params.id);

  try {
    const result = await db.query('SELECT * FROM resources WHERE id = $1', [resourceId]);
    const resource = result.rows[0];

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    // Enforce DBAC
    if (req.user.role !== 'super_admin' && resource.department_id !== req.user.departmentId) {
      return res.status(403).json({ message: 'Access Denied: Resource belongs to another department.' });
    }

    if (resource.approval_status !== 'approved' && req.user.role === 'student') {
      return res.status(403).json({ message: 'Access Denied: Resource is not approved yet.' });
    }

    // Log the download event
    await db.query(
      'INSERT INTO resource_download_logs (resource_id, user_id, ip_address) VALUES ($1, $2, $3)',
      [resourceId, req.user.id, req.ip]
    );

    // Provide the file URL (in production this would be a signed URL like AWS S3)
    return res.status(200).json({ downloadUrl: resource.file_url });
  } catch (err) {
    console.error('Download resource error:', err);
    return res.status(500).json({ message: 'Internal server error during download validation.' });
  }
};
