import mongoose from 'mongoose';

// Schema for storing uploaded media files
const mediaFileSchema = new mongoose.Schema({
  // Original file information
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  
  // File identification
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    unique: true
  },
  
  // Cloudinary information
  cloudinaryId: {
    type: String,
    required: [true, 'Cloudinary public ID is required'],
    unique: true
  },
  
  url: {
    type: String,
    required: [true, 'File URL is required']
  },
  
  secureUrl: {
    type: String,
    required: [true, 'Secure URL is required']
  },
  
  // File metadata
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size must be positive']
  },
  
  format: {
    type: String,
    required: [true, 'File format is required']
  },
  
  resourceType: {
    type: String,
    enum: ['image', 'video', 'audio', 'raw'],
    required: [true, 'Resource type is required']
  },
  
  // Image/Video specific metadata
  dimensions: {
    width: Number,
    height: Number
  },
  
  duration: {
    type: Number, // in seconds, for videos
    min: [0, 'Duration must be positive']
  },
  
  // File categorization
  category: {
    type: String,
    enum: [
      'hero_background',
      'hero_video', 
      'about_image',
      'game_screenshot',
      'character_image',
      'feature_icon',
      'team_photo',
      'logo',
      'thumbnail',
      'song_audio',
      'song_cover',
      'general'
    ],
    default: 'general'
  },
  
  // Usage tracking
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  
  lastUsed: {
    type: Date,
    default: Date.now
  },
  
  // Optimization information
  isOptimized: {
    type: Boolean,
    default: false
  },
  
  optimizedVersions: [{
    size: String, // 'thumbnail', 'small', 'medium', 'large'
    url: String,
    width: Number,
    height: Number
  }],
  
  // File status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Upload information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: [true, 'Uploader information is required']
  },
  
  // Alternative text for accessibility
  altText: {
    en: String,
    hi: String,
    ru: String,
    ko: String,
    zh: String,
    ja: String,
    es: String
  },
  
  // File tags for organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Description
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
mediaFileSchema.index({ cloudinaryId: 1 });
mediaFileSchema.index({ resourceType: 1 });
mediaFileSchema.index({ category: 1 });
mediaFileSchema.index({ isActive: 1 });
mediaFileSchema.index({ uploadedBy: 1 });
mediaFileSchema.index({ tags: 1 });
mediaFileSchema.index({ createdAt: -1 });

// Virtual for file size in human readable format
mediaFileSchema.virtual('humanReadableSize').get(function() {
  const bytes = this.size;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Virtual for duration in human readable format
mediaFileSchema.virtual('humanReadableDuration').get(function() {
  if (!this.duration) return null;
  
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Method to increment usage count
mediaFileSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  this.lastUsed = new Date();
  return this.save({ validateBeforeSave: false });
};

// Method to get optimized URL for specific size
mediaFileSchema.methods.getOptimizedUrl = function(size = 'medium') {
  const optimized = this.optimizedVersions.find(v => v.size === size);
  return optimized ? optimized.url : this.url;
};

// Static method to find by category
mediaFileSchema.statics.findByCategory = function(category, options = {}) {
  const query = { 
    category, 
    isActive: true 
  };
  
  return this.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to find by resource type
mediaFileSchema.statics.findByType = function(resourceType, options = {}) {
  const query = { 
    resourceType, 
    isActive: true 
  };
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

// Static method to search files
mediaFileSchema.statics.search = function(searchTerm, options = {}) {
  const query = {
    isActive: true,
    $or: [
      { originalName: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ]
  };
  
  if (options.resourceType) {
    query.resourceType = options.resourceType;
  }
  
  if (options.category) {
    query.category = options.category;
  }
  
  return this.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 20);
};

// Pre-remove middleware to track deletion
mediaFileSchema.pre('remove', async function(next) {
  console.log(`Deleting media file: ${this.originalName} (${this.cloudinaryId})`);
  next();
});

const MediaFile = mongoose.model('MediaFile', mediaFileSchema);

export default MediaFile;