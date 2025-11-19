import express from 'express';
import multer from 'multer';
import Logo from '../models/Logo.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { uploadToCloudinary, uploadOptions } from '../config/cloudinary.js';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Please upload an image file.`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size for logos
  }
});

// Get logo (public)
router.get('/', async (req, res) => {
  try {
    const logo = await Logo.findOne({ isActive: true });
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    res.json({
      success: true,
      data: { logo }
    });
  } catch (error) {
    console.error('Get logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logo',
      error: error.message
    });
  }
});

// Get logo for admin
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const logo = await Logo.findOne();
    
    if (!logo) {
      return res.status(404).json({
        success: false,
        message: 'Logo not found'
      });
    }

    res.json({
      success: true,
      data: { logo }
    });
  } catch (error) {
    console.error('Get logo admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch logo',
      error: error.message
    });
  }
});

// Create or Update logo (admin only)
router.post('/', authenticateAdmin, upload.single('logo'), async (req, res) => {
  try {
    const { altText, width, height, isActive } = req.body;
    const file = req.file;

    // Check if logo already exists
    let logo = await Logo.findOne();
    
    // If uploading new logo file
    if (file) {
      console.log('Uploading logo to Cloudinary...', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      // Upload to Cloudinary
      const result = await uploadToCloudinary(file.buffer, {
        ...uploadOptions.images,
        folder: 'logos',
        resource_type: 'image'
      });

      console.log('Cloudinary upload result:', {
        public_id: result.public_id,
        secure_url: result.secure_url
      });

      if (logo) {
        // Update existing logo
        logo.logoUrl = result.secure_url;
        logo.altText = altText || logo.altText;
        logo.width = width ? parseInt(width) : logo.width;
        logo.height = height ? parseInt(height) : logo.height;
        logo.isActive = isActive !== undefined ? isActive === 'true' : logo.isActive;
        await logo.save();
      } else {
        // Create new logo
        logo = new Logo({
          logoUrl: result.secure_url,
          altText: altText || 'IDOL BE Logo',
          width: width ? parseInt(width) : 120,
          height: height ? parseInt(height) : 40,
          isActive: isActive !== undefined ? isActive === 'true' : true
        });
        await logo.save();
      }
    } else if (logo) {
      // Update only metadata if no new file uploaded
      if (altText) logo.altText = altText;
      if (width) logo.width = parseInt(width);
      if (height) logo.height = parseInt(height);
      if (isActive !== undefined) logo.isActive = isActive === 'true';
      await logo.save();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please upload a logo image'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Logo saved successfully',
      data: { logo }
    });
  } catch (error) {
    console.error('Save logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save logo',
      error: error.message
    });
  }
});

export default router;
