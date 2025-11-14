import express from 'express';
import multer from 'multer';
import { body, param, validationResult } from 'express-validator';
import { authenticateAdmin, requirePermission } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { uploadToCloudinary, deleteFromCloudinary, uploadOptions } from '../config/cloudinary.js';
import MediaFile from '../models/MediaFile.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  console.log('File filter check:', {
    fieldname: file.fieldname,
    originalname: file.originalname,
    mimetype: file.mimetype
  });

  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm'];
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Max 10 files per request
  }
});

// Helper function to determine file category based on field name
const getFileCategory = (fieldname, filename) => {
  const name = filename.toLowerCase();
  
  if (fieldname === 'hero_video' || name.includes('hero') || name.includes('intro')) {
    return 'hero_video';
  }
  if (fieldname === 'hero_background' || name.includes('hero_bg')) {
    return 'hero_background';
  }
  if (name.includes('about')) {
    return 'about_image';
  }
  if (name.includes('game') || name.includes('screenshot')) {
    return 'game_screenshot';
  }
  if (name.includes('character') || name.includes('ana')) {
    return 'character_image';
  }
  if (name.includes('feature') || name.includes('icon')) {
    return 'feature_icon';
  }
  if (name.includes('team') || name.includes('artist')) {
    return 'team_photo';
  }
  if (name.includes('logo')) {
    return 'logo';
  }
  if (name.includes('thumb')) {
    return 'thumbnail';
  }
  
  return 'general';
};

// @desc    Upload single file
// @route   POST /api/upload/single
// @access  Private
router.post('/single',
  authenticateAdmin,
  requirePermission('media_upload'),
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ]),
  [
    body('category')
      .optional()
      .isIn([
        'hero_background', 'hero_video', 'about_image', 'game_screenshot',
        'character_image', 'feature_icon', 'team_photo', 'logo', 'thumbnail', 'general'
      ])
      .withMessage('Invalid category'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('altText')
      .optional()
      .isObject()
      .withMessage('Alt text must be an object with language keys')
  ],
  asyncHandler(async (req, res) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: errors.array()
      });
    }

    // Get the uploaded file from any of the possible field names
    const file = req.files?.file?.[0] || req.files?.image?.[0] || req.files?.video?.[0];

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { category, description, tags = [], altText = {} } = req.body;

    try {
      // Determine file type and upload options
      const isVideo = file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const options = isVideo ? uploadOptions.videos : uploadOptions.images;

      // Upload to Cloudinary
      console.log('Uploading to Cloudinary...', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        resourceType,
        fieldname: file.fieldname
      });

      const result = await uploadToCloudinary(file.buffer, {
        ...options,
        resource_type: resourceType
      });

      console.log('Cloudinary upload result:', {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height
      });

      // Create media file record
      const mediaFile = new MediaFile({
        originalName: file.originalname,
        filename: result.public_id.split('/').pop(),
        cloudinaryId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        mimeType: file.mimetype,
        size: file.size,
        format: result.format,
        resourceType: resourceType,
        dimensions: {
          width: result.width,
          height: result.height
        },
        duration: result.duration,
        category: category || getFileCategory(file.fieldname, file.originalname),
        description: description,
        tags: Array.isArray(tags) ? tags : [],
        altText: altText,
        uploadedBy: req.admin._id,
        isOptimized: true,
        optimizedVersions: result.eager ? result.eager.map(eager => ({
          size: eager.transformation.includes('thumb') ? 'thumbnail' : 'medium',
          url: eager.secure_url,
          width: eager.width,
          height: eager.height
        })) : []
      });

      await mediaFile.save();

      // Populate uploader info
      await mediaFile.populate('uploadedBy', 'name email');

      // Return URLs based on file type for easy use
      const responseData = {
        file: mediaFile
      };

      if (isVideo) {
        responseData.videoUrl = result.secure_url;
      } else {
        responseData.imageUrl = result.secure_url;
      }

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: responseData
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'File upload failed',
        error: error.message
      });
    }
  })
);

// @desc    Upload multiple files
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple',
  authenticateAdmin,
  requirePermission('media_upload'),
  upload.array('files', 10),
  [
    body('category')
      .optional()
      .isIn([
        'hero_background', 'hero_video', 'about_image', 'game_screenshot',
        'character_image', 'feature_icon', 'team_photo', 'logo', 'thumbnail', 'general'
      ])
      .withMessage('Invalid category'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array')
  ],
  asyncHandler(async (req, res) => {
    // Check validation errors
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input data',
        errors: validationErrors.array()
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { category, description, tags = [] } = req.body;
    const uploadedFiles = [];
    const uploadErrors = [];

    // Upload files sequentially to avoid overwhelming Cloudinary
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      
      try {
        const isVideo = file.mimetype.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';
        const options = isVideo ? uploadOptions.videos : uploadOptions.images;

        const result = await uploadToCloudinary(file.buffer, {
          ...options,
          resource_type: resourceType
        });

        const mediaFile = new MediaFile({
          originalName: file.originalname,
          filename: result.public_id.split('/').pop(),
          cloudinaryId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          mimeType: file.mimetype,
          size: file.size,
          format: result.format,
          resourceType: resourceType,
          dimensions: {
            width: result.width,
            height: result.height
          },
          duration: result.duration,
          category: category || getFileCategory(file.fieldname, file.originalname),
          description: description,
          tags: Array.isArray(tags) ? tags : [],
          uploadedBy: req.admin._id,
          isOptimized: true,
          optimizedVersions: result.eager ? result.eager.map(eager => ({
            size: eager.transformation.includes('thumb') ? 'thumbnail' : 'medium',
            url: eager.secure_url,
            width: eager.width,
            height: eager.height
          })) : []
        });

        await mediaFile.save();
        await mediaFile.populate('uploadedBy', 'name email');
        
        uploadedFiles.push(mediaFile);

      } catch (error) {
        console.error(`Upload error for ${file.originalname}:`, error);
        uploadErrors.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully${uploadErrors.length > 0 ? `, ${uploadErrors.length} failed` : ''}`,
      data: {
        files: uploadedFiles,
        errors: uploadErrors
      }
    });
  })
);

// @desc    Get all media files
// @route   GET /api/upload/files
// @access  Private
router.get('/files',
  authenticateAdmin,
  requirePermission('media_upload'),
  asyncHandler(async (req, res) => {
    const {
      category,
      resourceType,
      page = 1,
      limit = 20,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };
    
    if (category) query.category = category;
    if (resourceType) query.resourceType = resourceType;
    
    if (search) {
      query.$or = [
        { originalName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query with pagination
    const [files, total] = await Promise.all([
      MediaFile.find(query)
        .populate('uploadedBy', 'name email')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      MediaFile.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        files,
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

// @desc    Get single media file
// @route   GET /api/upload/files/:id
// @access  Private
router.get('/files/:id',
  authenticateAdmin,
  requirePermission('media_upload'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid file ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID',
        errors: errors.array()
      });
    }

    const file = await MediaFile.findById(req.params.id)
      .populate('uploadedBy', 'name email avatar');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        file
      }
    });
  })
);

// @desc    Update media file metadata
// @route   PUT /api/upload/files/:id
// @access  Private
router.put('/files/:id',
  authenticateAdmin,
  requirePermission('media_upload'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid file ID'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    body('tags')
      .optional()
      .isArray()
      .withMessage('Tags must be an array'),
    body('category')
      .optional()
      .isIn([
        'hero_background', 'hero_video', 'about_image', 'game_screenshot',
        'character_image', 'feature_icon', 'team_photo', 'logo', 'thumbnail', 'general'
      ])
      .withMessage('Invalid category'),
    body('altText')
      .optional()
      .isObject()
      .withMessage('Alt text must be an object')
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

    const { description, tags, category, altText } = req.body;

    const file = await MediaFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Update file metadata
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (altText !== undefined) updateData.altText = altText;

    const updatedFile = await MediaFile.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'File metadata updated successfully',
      data: {
        file: updatedFile
      }
    });
  })
);

// @desc    Delete media file
// @route   DELETE /api/upload/files/:id
// @access  Private
router.delete('/files/:id',
  authenticateAdmin,
  requirePermission('media_upload'),
  [
    param('id')
      .isMongoId()
      .withMessage('Invalid file ID')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file ID',
        errors: errors.array()
      });
    }

    const file = await MediaFile.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    try {
      // Delete from Cloudinary
      await deleteFromCloudinary(file.cloudinaryId, file.resourceType);
      console.log(`Deleted from Cloudinary: ${file.cloudinaryId}`);
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await MediaFile.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  })
);

export default router;