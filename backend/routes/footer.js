import express from 'express';
import Footer from '../models/Footer.js';
import { authenticateAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get footer (public)
router.get('/', async (req, res) => {
  try {
    const { lang = 'en' } = req.query;
    
    let footer = await Footer.findOne({ 'metadata.isActive': true });
    
    if (!footer) {
      return res.status(404).json({
        success: false,
        message: 'Footer not found'
      });
    }

    const localizedFooter = footer.getLocalizedFooter(lang);

    res.json({
      success: true,
      data: { footer: localizedFooter }
    });
  } catch (error) {
    console.error('Get footer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch footer',
      error: error.message
    });
  }
});

// Get footer for admin (with all languages)
router.get('/admin', authenticateAdmin, async (req, res) => {
  try {
    const footer = await Footer.findOne();
    
    if (!footer) {
      return res.status(404).json({
        success: false,
        message: 'Footer not found'
      });
    }

    res.json({
      success: true,
      data: { footer }
    });
  } catch (error) {
    console.error('Get footer admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch footer',
      error: error.message
    });
  }
});

// Create or Update footer (admin only)
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const footerData = {
      leftColumn: req.body.leftColumn,
      centerColumn: req.body.centerColumn,
      rightColumn: req.body.rightColumn,
      socialIcons: req.body.socialIcons || [],
      copyrightText: req.body.copyrightText,
      metadata: {
        isActive: req.body.metadata?.isActive !== undefined ? req.body.metadata.isActive : true,
        lastUpdated: Date.now()
      }
    };

    // Check if footer already exists
    let footer = await Footer.findOne();

    if (footer) {
      // Update existing footer
      Object.assign(footer, footerData);
      await footer.save();
    } else {
      // Create new footer
      footer = new Footer(footerData);
      await footer.save();
    }

    res.status(200).json({
      success: true,
      message: footer ? 'Footer updated successfully' : 'Footer created successfully',
      data: { footer }
    });
  } catch (error) {
    console.error('Save footer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save footer',
      error: error.message
    });
  }
});

// Add social icon (admin only)
router.post('/social-icon', authenticateAdmin, async (req, res) => {
  try {
    const { platform, url, iconUrl, order, isActive } = req.body;

    if (!platform || !url || !iconUrl) {
      return res.status(400).json({
        success: false,
        message: 'Platform, URL, and icon URL are required'
      });
    }

    let footer = await Footer.findOne();

    if (!footer) {
      return res.status(404).json({
        success: false,
        message: 'Footer not found. Please create footer first.'
      });
    }

    footer.socialIcons.push({
      platform,
      url,
      iconUrl,
      order: order || footer.socialIcons.length,
      isActive: isActive !== undefined ? isActive : true
    });

    await footer.save();

    res.json({
      success: true,
      message: 'Social icon added successfully',
      data: { footer }
    });
  } catch (error) {
    console.error('Add social icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add social icon',
      error: error.message
    });
  }
});

// Update social icon (admin only)
router.put('/social-icon/:index', authenticateAdmin, async (req, res) => {
  try {
    const { index } = req.params;
    const { platform, url, iconUrl, order, isActive } = req.body;

    let footer = await Footer.findOne();

    if (!footer) {
      return res.status(404).json({
        success: false,
        message: 'Footer not found'
      });
    }

    if (index < 0 || index >= footer.socialIcons.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid social icon index'
      });
    }

    if (platform) footer.socialIcons[index].platform = platform;
    if (url) footer.socialIcons[index].url = url;
    if (iconUrl) footer.socialIcons[index].iconUrl = iconUrl;
    if (order !== undefined) footer.socialIcons[index].order = order;
    if (isActive !== undefined) footer.socialIcons[index].isActive = isActive;

    await footer.save();

    res.json({
      success: true,
      message: 'Social icon updated successfully',
      data: { footer }
    });
  } catch (error) {
    console.error('Update social icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update social icon',
      error: error.message
    });
  }
});

// Delete social icon (admin only)
router.delete('/social-icon/:index', authenticateAdmin, async (req, res) => {
  try {
    const { index } = req.params;

    let footer = await Footer.findOne();

    if (!footer) {
      return res.status(404).json({
        success: false,
        message: 'Footer not found'
      });
    }

    if (index < 0 || index >= footer.socialIcons.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid social icon index'
      });
    }

    footer.socialIcons.splice(index, 1);
    await footer.save();

    res.json({
      success: true,
      message: 'Social icon deleted successfully',
      data: { footer }
    });
  } catch (error) {
    console.error('Delete social icon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete social icon',
      error: error.message
    });
  }
});

export default router;
