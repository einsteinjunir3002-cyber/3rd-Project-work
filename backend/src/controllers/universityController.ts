import { Request, Response } from 'express';
import University from '../models/University';

// @desc    Get all universities with optional search and filters, sorted by ranking
// @route   GET /api/universities
// @access  Public
export const getUniversities = async (req: Request, res: Response) => {
  try {
    const { search, type } = req.query;
    const filterQuery: any = {};

    if (search) {
      filterQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    if (type && (type === 'Public' || type === 'Private')) {
      filterQuery.type = type;
    }

    const universities = await University.find(filterQuery).sort({ ranking: 1 });
    res.status(200).json(universities);
  } catch (err: any) {
    res.status(500).json({ message: 'Error retrieving universities.', error: err.message });
  }
};

// @desc    Get a single university by ID
// @route   GET /api/universities/:id
// @access  Public
export const getUniversityById = async (req: Request, res: Response) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found.' });
    }
    res.status(200).json(university);
  } catch (err: any) {
    res.status(500).json({ message: 'Error retrieving university details.', error: err.message });
  }
};

// @desc    Create a new university profile
// @route   POST /api/universities
// @access  Private/Admin
export const createUniversity = async (req: Request, res: Response) => {
  try {
    const {
      name,
      ranking,
      image,
      type,
      location,
      established,
      academicsInfo,
      performanceReview,
      feesRange,
      scholarshipsInfo,
      programsOffered,
      admissionRequirements
    } = req.body;

    const existing = await University.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'University with this name already exists.' });
    }

    const university = new University({
      name,
      ranking: Number(ranking),
      image,
      type,
      location,
      established: Number(established),
      academicsInfo,
      performanceReview,
      feesRange,
      scholarshipsInfo,
      programsOffered: Array.isArray(programsOffered) ? programsOffered : [],
      admissionRequirements
    });

    await university.save();
    res.status(201).json({ message: 'University profile created successfully.', university });
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating university profile.', error: err.message });
  }
};

// @desc    Update a university profile
// @route   PUT /api/universities/:id
// @access  Private/Admin
export const updateUniversity = async (req: Request, res: Response) => {
  try {
    const university = await University.findById(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found.' });
    }

    const fieldsToUpdate = [
      'name',
      'ranking',
      'image',
      'type',
      'location',
      'established',
      'academicsInfo',
      'performanceReview',
      'feesRange',
      'scholarshipsInfo',
      'programsOffered',
      'admissionRequirements'
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'ranking' || field === 'established') {
          (university as any)[field] = Number(req.body[field]);
        } else {
          (university as any)[field] = req.body[field];
        }
      }
    });

    await university.save();
    res.status(200).json({ message: 'University profile updated successfully.', university });
  } catch (err: any) {
    res.status(500).json({ message: 'Error updating university profile.', error: err.message });
  }
};

// @desc    Delete a university profile
// @route   DELETE /api/universities/:id
// @access  Private/Admin
export const deleteUniversity = async (req: Request, res: Response) => {
  try {
    const university = await University.findByIdAndDelete(req.params.id);
    if (!university) {
      return res.status(404).json({ message: 'University not found.' });
    }
    res.status(200).json({ message: 'University profile deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error deleting university profile.', error: err.message });
  }
};
