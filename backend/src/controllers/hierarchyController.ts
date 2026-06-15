import { Request, Response } from 'express';
import { db } from '../config/db';

export const getFaculties = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT id, code, name FROM faculties ORDER BY name ASC');
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching faculties:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  const { facultyId } = req.query;
  try {
    let query = 'SELECT id, faculty_id, code, name FROM departments';
    const params: any[] = [];
    if (facultyId) {
      query += ' WHERE faculty_id = $1';
      params.push(facultyId);
    }
    query += ' ORDER BY name ASC';
    
    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching departments:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPrograms = async (req: Request, res: Response) => {
  const { departmentId } = req.query;
  try {
    let query = 'SELECT id, department_id, code, name, type FROM programs';
    const params: any[] = [];
    if (departmentId) {
      query += ' WHERE department_id = $1';
      params.push(departmentId);
    }
    query += ' ORDER BY name ASC';
    
    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching programs:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCourses = async (req: Request, res: Response) => {
  const { programId } = req.query;
  try {
    let query = 'SELECT id, program_id, code, title, description FROM courses';
    const params: any[] = [];
    if (programId) {
      query += ' WHERE program_id = $1';
      params.push(programId);
    }
    query += ' ORDER BY title ASC';
    
    const result = await db.query(query, params);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching courses:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
