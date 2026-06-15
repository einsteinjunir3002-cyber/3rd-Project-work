import { Request, Response } from 'express';
import { db } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';
import axios from 'axios';

// Get all approved domains
export const getApprovedDomains = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db.query(`
      SELECT ad.*, u.name as added_by_name 
      FROM approved_domains ad
      LEFT JOIN users u ON ad.added_by = u.id
      ORDER BY ad.created_at DESC
    `);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching approved domains:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Add a new approved domain
export const addApprovedDomain = async (req: AuthenticatedRequest, res: Response) => {
  const { domain } = req.body;
  if (!domain) return res.status(400).json({ message: 'Domain is required.' });

  try {
    // Sanitize domain
    const cleanDomain = domain.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    
    const result = await db.query(
      'INSERT INTO approved_domains (domain, status, added_by) VALUES ($1, $2, $3) RETURNING *',
      [cleanDomain, 'active', req.user.id]
    );
    return res.status(201).json({ message: 'Domain approved successfully.', domain: result.rows[0] });
  } catch (err: any) {
    if (err.code === '23505') { // Unique violation
      return res.status(400).json({ message: 'Domain is already approved.' });
    }
    console.error('Error adding approved domain:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

// Fetch external resource from an approved domain
export const fetchExternalResource = async (req: AuthenticatedRequest, res: Response) => {
  const { url, title, description, departmentId, programId, courseId } = req.body;
  if (!url || !title) return res.status(400).json({ message: 'URL and Title are required.' });

  try {
    const targetDomain = url.toLowerCase().replace(/^https?:\/\//, '').split('/')[0];
    
    const domainCheck = await db.query('SELECT * FROM approved_domains WHERE domain = $1 AND status = $2', [targetDomain, 'active']);
    if (domainCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Error: URL domain is not in the approved domains list.' });
    }

    // Verify URL is reachable (optional ping check)
    // const ping = await axios.head(url);
    
    const result = await db.query(
      `INSERT INTO resources 
        (title, description, department_id, program_id, course_id, file_url, file_type, file_size, version_number, approval_status, uploaded_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, $9, $10) RETURNING *`,
      [
        title, description, 
        departmentId || req.user.departmentId, 
        programId || null, 
        courseId || null, 
        url, 'External Link', 'N/A', 
        'approved', req.user.id
      ]
    );

    return res.status(201).json({ message: 'External resource imported successfully.', resource: result.rows[0] });
  } catch (err) {
    console.error('Error fetching external resource:', err);
    return res.status(500).json({ message: 'Internal server error during external fetch.' });
  }
};

// Fetch audit logs for resource downloads
export const getResourceAuditLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const result = await db.query(`
      SELECT l.*, r.title as resource_title, u.name as user_name, u.email
      FROM resource_download_logs l
      JOIN resources r ON l.resource_id = r.id
      JOIN users u ON l.user_id = u.id
      ORDER BY l.downloaded_at DESC
      LIMIT 100
    `);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching resource logs:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};
