import express from 'express';
import { body, validationResult } from 'express-validator';
import Query from '../models/Query.js';
import { authenticateAdmin } from '../middleware/auth.js';
import { sendQueryNotification } from '../config/email.js';

const router = express.Router();

// Public route: Submit a new query
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ max: 100 }).withMessage('Name must not exceed 100 characters'),
    body('age')
      .notEmpty().withMessage('Age is required')
      .isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('phone')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 20 }).withMessage('Phone number must not exceed 20 characters'),
    body('message')
      .trim()
      .notEmpty().withMessage('Message is required')
      .isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
      .isLength({ max: 2000 }).withMessage('Message must not exceed 2000 characters')
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { name, age, email, phone, message } = req.body;

      // Create new query
      const query = new Query({
        name,
        age: parseInt(age),
        email,
        phone: phone || '',
        message,
        status: 'new'
      });

      await query.save();

      // Send email notification (async, don't wait for it)
      sendQueryNotification({
        name: query.name,
        age: query.age,
        email: query.email,
        phone: query.phone,
        message: query.message,
        createdAt: query.createdAt
      }).catch(err => {
        console.error('Failed to send email notification:', err.message);
        // Don't fail the request if email fails
      });

      res.status(201).json({
        success: true,
        message: 'Your message has been sent successfully!',
        data: {
          id: query._id,
          name: query.name,
          email: query.email,
          createdAt: query.createdAt
        }
      });
    } catch (error) {
      console.error('Error submitting query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit your message. Please try again later.'
      });
    }
  }
);

// Admin route: Get all queries with optional status filter
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['new', 'read', 'responded'].includes(status)) {
      filter.status = status;
    }

    const queries = await Query.find(filter)
      .sort({ createdAt: -1 })
      .select('name age email phone message status createdAt updatedAt');

    res.json({
      success: true,
      data: queries
    });
  } catch (error) {
    console.error('Error fetching queries:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queries'
    });
  }
});

// Admin route: Get single query by ID
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const query = await Query.findById(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.json({
      success: true,
      data: query
    });
  } catch (error) {
    console.error('Error fetching query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch query'
    });
  }
});

// Admin route: Update query status
router.patch(
  '/:id',
  authenticateAdmin,
  [
    body('status')
      .notEmpty().withMessage('Status is required')
      .isIn(['new', 'read', 'responded']).withMessage('Invalid status value')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { status } = req.body;

      const query = await Query.findByIdAndUpdate(
        req.params.id,
        { status, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );

      if (!query) {
        return res.status(404).json({
          success: false,
          message: 'Query not found'
        });
      }

      res.json({
        success: true,
        message: 'Query status updated successfully',
        data: query
      });
    } catch (error) {
      console.error('Error updating query:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update query status'
      });
    }
  }
);

// Admin route: Delete query
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const query = await Query.findByIdAndDelete(req.params.id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    res.json({
      success: true,
      message: 'Query deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete query'
    });
  }
});

export default router;
