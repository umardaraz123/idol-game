import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Content, { SUPPORTED_LANGUAGES, CONTENT_TYPES } from '../models/Content.js';
import { authenticateAdmin, requirePermission } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation rules
const contentValidation = [
  body('key')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-z0-9_]+$/)
    .withMessage('Key must contain only lowercase letters, numbers, and underscores'),
  
  body('type')
    .isIn(CONTENT_TYPES)
    .withMessage(`Type must be one of: ${CONTENT_TYPES.join(', ')}`),
  
  body('title.en')
    .notEmpty()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('English title is required and must be between 3-200 characters'),
  
  body('title.hi')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Hindi title must not exceed 200 characters'),
  
  body('title.ru')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Russian title must not exceed 200 characters'),
  
  body('title.ko')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Korean title must not exceed 200 characters'),
  
  body('title.zh')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Chinese title must not exceed 200 characters'),
  
  body('title.ja')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Japanese title must not exceed 200 characters'),
  
  body('title.es')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Spanish title must not exceed 200 characters'),
  
  body('description.en')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('English description must not exceed 2000 characters'),
  
  body('imageUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Image URL must be a valid URL');
      }
    }),
  
  body('videoUrl')
    .optional({ checkFalsy: true })
    .trim()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) return true;
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error('Video URL must be a valid URL');
      }
    }),
  
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
    .withMessage('isFeatured must be a boolean'),
  
  body('metadata.tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('metadata.tags.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Each tag must be between 2-30 characters')
];

// @desc    Get all content items
// @route   GET /api/content
// @access  Private
router.get('/', 
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    query('type')
      .optional()
      .isIn(CONTENT_TYPES)
      .withMessage(`Type must be one of: ${CONTENT_TYPES.join(', ')}`),
    query('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be true or false'),
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
      .isIn(['createdAt', 'updatedAt', 'title.en', 'metadata.order', 'type'])
      .withMessage('Invalid sort field'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be asc or desc')
  ],
  asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      type,
      isActive,
      page = 1,
      limit = 20,
      sort = 'metadata.order',
      order = 'asc',
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (type) query.type = type;
    if (isActive !== undefined) query['metadata.isActive'] = isActive === 'true';
    
    // Add search functionality
    if (search) {
      query.$or = [
        { 'title.en': { $regex: search, $options: 'i' } },
        { 'description.en': { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { 'metadata.tags': { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [contents, total] = await Promise.all([
      Content.find(query)
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Content.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        contents,
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

// @desc    Get single content item
// @route   GET /api/content/:id
// @access  Private
router.get('/:id',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid content ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID',
        errors: errors.array()
      });
    }

    const content = await Content.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('lastModifiedBy', 'name email avatar');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        content
      }
    });
  })
);

// @desc    Create new content
// @route   POST /api/content
// @access  Private
router.post('/',
  authenticateAdmin,
  requirePermission('content_manage'),
  contentValidation,
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
      type,
      title,
      description = {},
      subtitle = {},
      imageUrl,
      videoUrl,
      media = { images: [], videos: [] },
      metadata = {},
      seo = {}
    } = req.body;

    // Check if key already exists
    if (key) {
      const existingContent = await Content.findOne({ key });
      if (existingContent) {
        return res.status(409).json({
          success: false,
          message: 'Content with this key already exists'
        });
      }
    }

    // Create new content
    const content = new Content({
      key,
      type,
      title,
      description,
      subtitle,
      imageUrl,
      videoUrl,
      media,
      metadata: {
        order: metadata.order || 0,
        isActive: metadata.isActive !== undefined ? metadata.isActive : true,
        isFeatured: metadata.isFeatured || false,
        tags: metadata.tags || [],
        category: metadata.category
      },
      seo,
      createdBy: req.admin._id
    });

    await content.save();

    // Populate the created content
    await content.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: {
        content
      }
    });
  })
);

// @desc    Update content
// @route   PUT /api/content/:id
// @access  Private
router.put('/:id',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid content ID'),
    ...contentValidation
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

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    const {
      key,
      type,
      title,
      description,
      subtitle,
      imageUrl,
      videoUrl,
      media,
      metadata,
      seo
    } = req.body;

    // Check if key already exists (if changed)
    if (key && key !== content.key) {
      const existingContent = await Content.findOne({ 
        key, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingContent) {
        return res.status(409).json({
          success: false,
          message: 'Content with this key already exists'
        });
      }
    }

    // Update content
    const updateData = {
      ...(key && { key }),
      ...(type && { type }),
      ...(title && { title }),
      ...(description && { description }),
      ...(subtitle && { subtitle }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(videoUrl !== undefined && { videoUrl }),
      ...(media && { media }),
      ...(metadata && { metadata }),
      ...(seo && { seo }),
      lastModifiedBy: req.admin._id
    };

    const updatedContent = await Content.findByIdAndUpdate(
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
      message: 'Content updated successfully',
      data: {
        content: updatedContent
      }
    });
  })
);

// @desc    Delete content
// @route   DELETE /api/content/:id
// @access  Private
router.delete('/:id',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid content ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content ID',
        errors: errors.array()
      });
    }

    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    await Content.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Content deleted successfully'
    });
  })
);

// @desc    Bulk update content order
// @route   PUT /api/content/bulk/reorder
// @access  Private
router.put('/bulk/reorder',
  authenticateAdmin,
  requirePermission('content_manage'),
  [
    body('updates')
      .isArray({ min: 1 })
      .withMessage('Updates must be a non-empty array'),
    body('updates.*.id')
      .isMongoId()
      .withMessage('Each update must have a valid content ID'),
    body('updates.*.order')
      .isInt({ min: 0 })
      .withMessage('Each update must have a valid order number')
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

    const { updates } = req.body;

    // Perform bulk update
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.id },
        update: { 
          'metadata.order': update.order,
          lastModifiedBy: req.admin._id
        }
      }
    }));

    const result = await Content.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Content order updated successfully',
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  })
);

// @desc    Get content types and supported languages
// @route   GET /api/content/meta/info
// @access  Private
router.get('/meta/info',
  authenticateAdmin,
  requirePermission('content_manage'),
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        supportedLanguages: SUPPORTED_LANGUAGES,
        contentTypes: CONTENT_TYPES,
        languageLabels: {
          en: 'English',
          hi: 'हिन्दी (Hindi)',
          ru: 'Русский (Russian)',
          ko: '한국어 (Korean)',
          zh: '中文 (Chinese)',
          ja: '日本語 (Japanese)',
          es: 'Español (Spanish)'
        },
        typeLabels: {
          hero_section: 'Hero Section',
          about_section: 'About Section',
          game_highlights: 'Game Highlights',
          who_is_ana: 'Who is Ana',
          features: 'Features',
          artist_team: 'Artist Team',
          footer: 'Footer',
          navbar: 'Navigation Bar',
          general: 'General Content'
        }
      }
    });
  })
);

export default router;