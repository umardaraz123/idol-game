import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Song, { SUPPORTED_LANGUAGES } from '../models/Song.js';
import { authenticateAdmin, requirePermission } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation rules
const songValidation = [
  body('key')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_\s-]+$/)
    .withMessage('Key must contain only letters, numbers, spaces, underscores, and hyphens'),
  
  body('title.en')
    .notEmpty()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('English title is required and must be between 1-200 characters'),
  
  body('audioUrl')
    .notEmpty()
    .trim()
    .withMessage('Audio URL is required'),
  
  body('duration')
    .isFloat({ min: 0 })
    .withMessage('Duration must be a positive number'),
  
  body('genre')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Genre must not exceed 50 characters'),
  
  body('language')
    .optional()
    .isIn(SUPPORTED_LANGUAGES)
    .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
  
  body('releaseYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Invalid release year'),
  
  body('metadata.order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a positive integer'),
  
  body('metadata.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  body('metadata.isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean')
];

// @desc    Get all songs (Admin)
// @route   GET /api/songs
// @access  Private
router.get('/',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    query('genre')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Invalid genre'),
    query('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be true or false'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1-100'),
    query('sort')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'title.en', 'metadata.order', 'metadata.playCount'])
      .withMessage('Invalid sort field'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      genre,
      featured,
      page = 1,
      limit = 20,
      sort = 'metadata.order',
      order = 'asc',
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (genre) query.genre = genre;
    if (featured !== undefined) query['metadata.isFeatured'] = featured === 'true';
    
    // Add search functionality
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'artist.en': { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [songs, total] = await Promise.all([
      Song.find(query)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Song.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        songs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  })
);

// @desc    Get single song (Admin)
// @route   GET /api/songs/:id
// @access  Private
router.get('/:id',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid song ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid song ID',
        errors: errors.array()
      });
    }

    const song = await Song.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('lastModifiedBy', 'name email avatar');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        song
      }
    });
  })
);

// @desc    Create new song
// @route   POST /api/songs
// @access  Private
router.post('/',
  authenticateAdmin,
  requirePermission('content_manage'),
  songValidation,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array()
      });
    }

    const {
      key,
      title,
      description = {},
      artist = {},
      audioUrl,
      cloudinaryId,
      duration,
      coverImage = {},
      genre,
      language = 'en',
      releaseYear,
      metadata = {},
      lyrics = {}
    } = req.body;

    // Check if key already exists
    if (key) {
      const existingSong = await Song.findOne({ key });
      if (existingSong) {
        return res.status(409).json({
          success: false,
          message: 'Song with this key already exists'
        });
      }
    }

    // Create new song
    const song = new Song({
      key,
      title,
      description,
      artist,
      audioUrl,
      cloudinaryId,
      duration,
      coverImage,
      genre,
      language,
      releaseYear,
      metadata: {
        order: metadata.order || 0,
        isActive: metadata.isActive !== undefined ? metadata.isActive : true,
        isFeatured: metadata.isFeatured || false,
        tags: metadata.tags || [],
        playCount: 0
      },
      lyrics,
      createdBy: req.admin._id
    });

    await song.save();

    // Populate the created song
    await song.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Song created successfully',
      data: {
        song
      }
    });
  })
);

// @desc    Update song
// @route   PUT /api/songs/:id
// @access  Private
router.put('/:id',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid song ID'),
    ...songValidation
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array()
      });
    }

    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    const {
      key,
      title,
      description,
      artist,
      audioUrl,
      cloudinaryId,
      duration,
      coverImage,
      genre,
      language,
      releaseYear,
      metadata,
      lyrics
    } = req.body;

    // Check if key already exists (if changed)
    if (key && key !== song.key) {
      const existingSong = await Song.findOne({ 
        key, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingSong) {
        return res.status(409).json({
          success: false,
          message: 'Song with this key already exists'
        });
      }
    }

    // Update song
    const updateData = {
      ...(key && { key }),
      ...(title && { title }),
      ...(description && { description }),
      ...(artist && { artist }),
      ...(audioUrl !== undefined && { audioUrl }),
      ...(cloudinaryId !== undefined && { cloudinaryId }),
      ...(duration !== undefined && { duration }),
      ...(coverImage && { coverImage }),
      ...(genre !== undefined && { genre }),
      ...(language !== undefined && { language }),
      ...(releaseYear !== undefined && { releaseYear }),
      ...(metadata && { metadata }),
      ...(lyrics && { lyrics }),
      lastModifiedBy: req.admin._id
    };

    const updatedSong = await Song.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    )
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Song updated successfully',
      data: {
        song: updatedSong
      }
    });
  })
);

// @desc    Delete song
// @route   DELETE /api/songs/:id
// @access  Private
router.delete('/:id',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid song ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid song ID',
        errors: errors.array()
      });
    }

    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    await Song.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Song deleted successfully'
    });
  })
);

// @desc    Get all songs (Public - by language)
// @route   GET /api/songs/public/all
// @access  Public
router.get('/public/all',
  [
    query('language')
      .optional()
      .isIn(SUPPORTED_LANGUAGES)
      .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
    query('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be true or false'),
    query('genre')
      .optional()
      .trim(),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1-50')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const { 
      language = 'en', 
      featured,
      genre,
      limit = 20
    } = req.query;

    try {
      const options = {};
      if (featured === 'true') options.featured = true;
      if (genre) options.genre = genre;
      
      const songs = await Song.getByLanguage(language, options);
      
      // Limit results
      const limitedSongs = songs.slice(0, parseInt(limit));

      res.status(200).json({
        success: true,
        data: {
          language,
          songs: limitedSongs,
          total: limitedSongs.length
        }
      });

    } catch (error) {
      console.error('Error fetching public songs:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching songs',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })
);

// @desc    Increment play count
// @route   POST /api/songs/public/:id/play
// @access  Public
router.post('/public/:id/play',
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid song ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid song ID',
        errors: errors.array()
      });
    }

    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    await song.incrementPlayCount();

    res.status(200).json({
      success: true,
      data: {
        playCount: song.metadata.playCount
      }
    });
  })
);

export default router;
