import express from 'express';
import { body, validationResult } from 'express-validator';
import Admin from '../models/Admin.js';
import { generateToken, authenticateAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
];

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errors: errors.array()
    });
  }

  const { email, password, rememberMe } = req.body;

  // Find admin by email
  const admin = await Admin.findActiveByEmail(email);
  
  if (!admin) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Check password
  const isMatch = await admin.comparePassword(password);
  
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }

  // Update last login
  await admin.updateLastLogin();

  // Generate token
  const token = generateToken(admin._id);

  // Set cookie options
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 7 days or 1 day
  };

  // Set cookie
  res.cookie('adminToken', token, cookieOptions);

  // Send response
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar,
        lastLogin: admin.lastLogin
      },
      token: token,
      expiresIn: rememberMe ? '7d' : '1d'
    }
  });
}));

// @desc    Admin logout
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticateAdmin, asyncHandler(async (req, res) => {
  // Clear cookie
  res.clearCookie('adminToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
}));

// @desc    Get current admin profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', authenticateAdmin, asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id).select('-password');
  
  res.status(200).json({
    success: true,
    data: {
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        avatar: admin.avatar,
        isActive: admin.isActive,
        lastLogin: admin.lastLogin,
        createdAt: admin.createdAt,
        updatedAt: admin.updatedAt
      }
    }
  });
}));

// @desc    Update admin profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', 
  authenticateAdmin,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email')
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

    const { name, email } = req.body;
    
    // Check if email already exists (if changed)
    if (email && email !== req.admin.email) {
      const existingAdmin = await Admin.findOne({ 
        email, 
        _id: { $ne: req.admin._id } 
      });
      
      if (existingAdmin) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update admin
    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.admin._id,
      { 
        ...(name && { name }),
        ...(email && { email })
      },
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        admin: updatedAdmin
      }
    });
  })
);

// @desc    Change admin password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', 
  authenticateAdmin, 
  changePasswordValidation, 
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

    const { currentPassword, newPassword } = req.body;

    // Get admin with password
    const admin = await Admin.findById(req.admin._id);

    // Check current password
    const isMatch = await admin.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  })
);

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
router.get('/verify', authenticateAdmin, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Token is valid',
    data: {
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        name: req.admin.name,
        role: req.admin.role,
        permissions: req.admin.permissions
      }
    }
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', authenticateAdmin, asyncHandler(async (req, res) => {
  // Generate new token
  const token = generateToken(req.admin._id);

  // Update cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  };

  res.cookie('adminToken', token, cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      token: token,
      expiresIn: '1d'
    }
  });
}));

export default router;