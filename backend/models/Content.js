import mongoose from 'mongoose';

// Supported languages
const SUPPORTED_LANGUAGES = [
  'en', // English
  'hi', // Hindi
  'ru', // Russian
  'ko', // Korean
  'zh', // Chinese
  'ja', // Japanese
  'es'  // Spanish
];

// Content types
const CONTENT_TYPES = [
  'hero_section',
  'about_section', 
  'game_highlights',
  'who_is_ana',
  'features',
  'artist_team',
  'footer',
  'navbar',
  'general'
];

// Schema for multilingual text content
const multilingualTextSchema = new mongoose.Schema({
  en: { type: String, default: '' },
  hi: { type: String, default: '' },
  ru: { type: String, default: '' },
  ko: { type: String, default: '' },
  zh: { type: String, default: '' },
  ja: { type: String, default: '' },
  es: { type: String, default: '' }
}, { _id: false });

// Schema for media files (images/videos)
const mediaSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  originalName: String,
  format: String,
  size: Number,
  width: Number,
  height: Number,
  duration: Number, // for videos
  resourceType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  }
}, { _id: false });

// Main content schema
const contentSchema = new mongoose.Schema({
  // Unique identifier for the content piece
  key: {
    type: String,
    required: [true, 'Content key is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9_]+$/, 'Key must contain only lowercase letters, numbers, and underscores']
  },
  
  // Content type for organization
  type: {
    type: String,
    enum: CONTENT_TYPES,
    required: [true, 'Content type is required']
  },
  
  // Multilingual titles
  title: {
    type: multilingualTextSchema,
    required: true
  },
  
  // Multilingual descriptions/content
  description: multilingualTextSchema,
  
  // Multilingual subtitles (for videos)
  subtitle: multilingualTextSchema,
  
  // Quick access URL fields (for simple image/video uploads)
  imageUrl: {
    type: String,
    trim: true
  },
  
  videoUrl: {
    type: String,
    trim: true
  },
  
  // LinkedIn profile URL (for team members)
  linkedinUrl: {
    type: String,
    trim: true
  },
  
  // Associated media files
  media: {
    images: [mediaSchema],
    videos: [mediaSchema],
    thumbnail: mediaSchema // Main thumbnail for the content
  },
  
  // Content metadata
  metadata: {
    order: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    category: {
      type: String,
      trim: true
    }
  },
  
  // SEO and additional data
  seo: {
    metaTitle: multilingualTextSchema,
    metaDescription: multilingualTextSchema,
    keywords: [{
      type: String,
      trim: true
    }]
  },
  
  // Publishing info
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  // Admin who created/modified
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
contentSchema.index({ key: 1 });
contentSchema.index({ type: 1 });
contentSchema.index({ 'metadata.isActive': 1 });
contentSchema.index({ 'metadata.order': 1 });
contentSchema.index({ publishedAt: -1 });
contentSchema.index({ 'metadata.tags': 1 });

// Virtual for media count
contentSchema.virtual('mediaCount').get(function() {
  const images = this.media.images ? this.media.images.length : 0;
  const videos = this.media.videos ? this.media.videos.length : 0;
  return images + videos;
});

// Method to get content for specific language
contentSchema.methods.getLocalizedContent = function(language = 'en') {
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'en';
  
  return {
    _id: this._id,
    key: this.key,
    type: this.type,
    title: this.title?.[lang] || this.title?.en || '',
    description: this.description?.[lang] || this.description?.en || '',
    subtitle: this.subtitle?.[lang] || this.subtitle?.en || '',
    imageUrl: this.imageUrl || '',
    videoUrl: this.videoUrl || '',
    linkedinUrl: this.linkedinUrl || '',
    media: this.media || { images: [], videos: [] },
    metadata: this.metadata || {},
    seo: {
      metaTitle: this.seo?.metaTitle?.[lang] || this.seo?.metaTitle?.en || '',
      metaDescription: this.seo?.metaDescription?.[lang] || this.seo?.metaDescription?.en || '',
      keywords: this.seo?.keywords || []
    },
    publishedAt: this.publishedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get all content for a language
contentSchema.statics.getByLanguage = async function(language = 'en', type = null) {
  const query = { 'metadata.isActive': true };
  if (type) query.type = type;
  
  const contents = await this.find(query)
    .sort({ 'metadata.order': 1, publishedAt: -1 })
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');
  
  return contents.map(content => content.getLocalizedContent(language));
};

// Static method to get content by key and language
contentSchema.statics.getByKey = async function(key, language = 'en') {
  const content = await this.findOne({ 
    key, 
    'metadata.isActive': true 
  })
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');
  
  return content ? content.getLocalizedContent(language) : null;
};

// Pre-save middleware
contentSchema.pre('save', function(next) {
  // Ensure at least English content exists
  if (!this.title.en) {
    return next(new Error('English title is required'));
  }
  
  // Auto-generate key from English title if not provided
  if (!this.key && this.title.en) {
    this.key = this.title.en
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
  }
  
  next();
});

// Static method to get supported languages
contentSchema.statics.getSupportedLanguages = function() {
  return SUPPORTED_LANGUAGES;
};

// Static method to get content types
contentSchema.statics.getContentTypes = function() {
  return CONTENT_TYPES;
};

const Content = mongoose.model('Content', contentSchema);

export default Content;
export { SUPPORTED_LANGUAGES, CONTENT_TYPES };