import express from 'express';
import { param, query, validationResult } from 'express-validator';
import Content, { SUPPORTED_LANGUAGES, CONTENT_TYPES } from '../models/Content.js';
import MediaFile from '../models/MediaFile.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all content for a specific language
// @route   GET /api/public/content
// @access  Public
router.get('/content',
  [
    query('language')
      .optional()
      .isIn(SUPPORTED_LANGUAGES)
      .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
    query('type')
      .optional()
      .isIn(CONTENT_TYPES)
      .withMessage(`Type must be one of: ${CONTENT_TYPES.join(', ')}`),
    query('featured')
      .optional()
      .isBoolean()
      .withMessage('Featured must be true or false')
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
      type, 
      featured 
    } = req.query;

    try {
      // Get content based on filters
      let contents;
      
      if (type) {
        contents = await Content.getByLanguage(language, type);
      } else {
        // Build query for multiple types
        const query = { 'metadata.isActive': true };
        
        if (featured === 'true') {
          query['metadata.isFeatured'] = true;
        }

        const allContents = await Content.find(query)
          .sort({ 'metadata.order': 1, publishedAt: -1 })
          .populate('createdBy', 'name email');
        
        contents = allContents.map(content => content.getLocalizedContent(language));
      }

      // Group content by type for better organization
      const groupedContent = {};
      
      contents.forEach(content => {
        if (!groupedContent[content.type]) {
          groupedContent[content.type] = [];
        }
        groupedContent[content.type].push(content);
      });

      res.status(200).json({
        success: true,
        data: {
          language,
          content: groupedContent,
          total: contents.length
        }
      });

    } catch (error) {
      console.error('Error fetching public content:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching content',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  })
);

// @desc    Get single content item by key
// @route   GET /api/public/content/:key
// @access  Public
router.get('/content/:key',
  [
    param('key')
      .trim()
      .isLength({ min: 3, max: 50 })
      .matches(/^[a-z0-9_]+$/)
      .withMessage('Invalid content key format'),
    query('language')
      .optional()
      .isIn(SUPPORTED_LANGUAGES)
      .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`)
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: errors.array()
      });
    }

    const { key } = req.params;
    const { language = 'en' } = req.query;

    try {
      const content = await Content.getByKey(key, language);

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

    } catch (error) {
      console.error('Error fetching content by key:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching content'
      });
    }
  })
);

// @desc    Get content by type and language
// @route   GET /api/public/content/type/:type
// @access  Public
router.get('/content/type/:type',
  [
    param('type')
      .isIn(CONTENT_TYPES)
      .withMessage(`Type must be one of: ${CONTENT_TYPES.join(', ')}`),
    query('language')
      .optional()
      .isIn(SUPPORTED_LANGUAGES)
      .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`)
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: errors.array()
      });
    }

    const { type } = req.params;
    const { language = 'en' } = req.query;

    try {
      const contents = await Content.getByLanguage(language, type);

      res.status(200).json({
        success: true,
        data: {
          language,
          type,
          contents,
          total: contents.length
        }
      });

    } catch (error) {
      console.error('Error fetching content by type:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching content'
      });
    }
  })
);

// @desc    Get featured media files
// @route   GET /api/public/media
// @access  Public
router.get('/media',
  [
    query('category')
      .optional()
      .isIn([
        'hero_background', 'hero_video', 'about_image', 'game_screenshot',
        'character_image', 'feature_icon', 'team_photo', 'logo', 'thumbnail', 'general'
      ])
      .withMessage('Invalid category'),
    query('type')
      .optional()
      .isIn(['image', 'video'])
      .withMessage('Type must be image or video'),
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
      category, 
      type, 
      limit = 20 
    } = req.query;

    try {
      // Build query
      const query = { 
        isActive: true 
      };
      
      if (category) query.category = category;
      if (type) query.resourceType = type;

      // Get media files
      const mediaFiles = await MediaFile.find(query)
        .select('originalName cloudinaryId url secureUrl mimeType format resourceType dimensions category tags altText optimizedVersions createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      // Increment usage count for accessed files
      const fileIds = mediaFiles.map(file => file._id);
      await MediaFile.updateMany(
        { _id: { $in: fileIds } },
        { 
          $inc: { usageCount: 1 },
          $set: { lastUsed: new Date() }
        }
      );

      res.status(200).json({
        success: true,
        data: {
          media: mediaFiles,
          total: mediaFiles.length,
          filters: {
            category,
            type
          }
        }
      });

    } catch (error) {
      console.error('Error fetching media files:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching media files'
      });
    }
  })
);

// @desc    Get supported languages and metadata
// @route   GET /api/public/meta
// @access  Public
router.get('/meta', asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      supportedLanguages: SUPPORTED_LANGUAGES,
      contentTypes: CONTENT_TYPES,
      languageLabels: {
        en: 'English',
        hi: 'हिन्दी',
        ru: 'Русский',
        ko: '한국어',
        zh: '中文',
        ja: '日本語',
        es: 'Español'
      },
      defaultLanguage: 'en',
      version: '1.0.0'
    }
  });
}));

// @desc    Search content across all languages
// @route   GET /api/public/search
// @access  Public
router.get('/search',
  [
    query('q')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2-100 characters'),
    query('language')
      .optional()
      .isIn(SUPPORTED_LANGUAGES)
      .withMessage(`Language must be one of: ${SUPPORTED_LANGUAGES.join(', ')}`),
    query('type')
      .optional()
      .isIn(CONTENT_TYPES)
      .withMessage(`Type must be one of: ${CONTENT_TYPES.join(', ')}`),
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
        message: 'Invalid search parameters',
        errors: errors.array()
      });
    }

    const { 
      q: searchQuery, 
      language = 'en', 
      type, 
      limit = 10 
    } = req.query;

    try {
      // Build search query
      const query = {
        'metadata.isActive': true
      };

      if (type) {
        query.type = type;
      }

      // Search across multiple language fields
      const searchRegex = new RegExp(searchQuery, 'i');
      query.$or = [
        { 'title.en': searchRegex },
        { 'title.hi': searchRegex },
        { 'title.ru': searchRegex },
        { 'title.ko': searchRegex },
        { 'title.zh': searchRegex },
        { 'title.ja': searchRegex },
        { 'title.es': searchRegex },
        { 'description.en': searchRegex },
        { 'description.hi': searchRegex },
        { 'description.ru': searchRegex },
        { 'description.ko': searchRegex },
        { 'description.zh': searchRegex },
        { 'description.ja': searchRegex },
        { 'description.es': searchRegex },
        { key: searchRegex },
        { 'metadata.tags': { $in: [searchRegex] } }
      ];

      // Execute search
      const results = await Content.find(query)
        .sort({ 'metadata.isFeatured': -1, 'metadata.order': 1 })
        .limit(parseInt(limit));

      // Convert to localized content
      const localizedResults = results.map(content => 
        content.getLocalizedContent(language)
      );

      res.status(200).json({
        success: true,
        data: {
          query: searchQuery,
          language,
          results: localizedResults,
          total: localizedResults.length,
          hasMore: results.length === parseInt(limit)
        }
      });

    } catch (error) {
      console.error('Error searching content:', error);
      res.status(500).json({
        success: false,
        message: 'Error searching content'
      });
    }
  })
);

// @desc    Get site statistics (optional auth for detailed stats)
// @route   GET /api/public/stats
// @access  Public
router.get('/stats', optionalAuth, asyncHandler(async (req, res) => {
  try {
    const [
      totalContent,
      activeContent,
      featuredContent,
      totalMedia,
      contentByType,
      recentContent
    ] = await Promise.all([
      Content.countDocuments({}),
      Content.countDocuments({ 'metadata.isActive': true }),
      Content.countDocuments({ 'metadata.isFeatured': true }),
      MediaFile.countDocuments({ isActive: true }),
      Content.aggregate([
        { $match: { 'metadata.isActive': true } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Content.find({ 'metadata.isActive': true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('key title.en type createdAt')
    ]);

    const stats = {
      content: {
        total: totalContent,
        active: activeContent,
        featured: featuredContent
      },
      media: {
        total: totalMedia
      },
      contentByType: contentByType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      ...(req.admin && {
        // Additional stats for authenticated admins
        recentContent: recentContent.map(content => ({
          key: content.key,
          title: content.title.en,
          type: content.type,
          createdAt: content.createdAt
        }))
      })
    };

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics'
    });
  }
}));

export default router;