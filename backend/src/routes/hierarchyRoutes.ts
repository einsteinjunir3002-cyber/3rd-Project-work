import { Router } from 'express';
import { getFaculties, getDepartments, getPrograms, getCourses } from '../controllers/hierarchyController';

const router = Router();

router.get('/faculties', getFaculties);
router.get('/departments', getDepartments);
router.get('/programs', getPrograms);
router.get('/courses', getCourses);

export default router;
