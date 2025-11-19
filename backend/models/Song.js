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

// Main song schema
const songSchema = new mongoose.Schema({
  // Unique identifier for the song
  key: {
    type: String,
    required: [true, 'Song key is required'],
    unique: true,
    trim: true,
    match: [/^[a-zA-Z0-9_\s-]+$/, 'Key must contain only letters, numbers, spaces, underscores, and hyphens']
  },
  
  // Multilingual titles
  title: {
    type: multilingualTextSchema,
    required: true
  },
  
  // Multilingual descriptions
  description: multilingualTextSchema,
  
  // Multilingual artist names
  artist: multilingualTextSchema,
  
  // Audio file URL (Cloudinary or external)
  audioUrl: {
    type: String,
    required: [true, 'Audio URL is required'],
    trim: true
  },
  
  // Cloudinary public ID (if uploaded to Cloudinary)
  cloudinaryId: {
    type: String,
    trim: true
  },
  
  // Song duration in seconds
  duration: {
    type: Number,
    min: [0, 'Duration must be positive'],
    required: [true, 'Duration is required']
  },
  
  // Cover/thumbnail image
  coverImage: {
    url: String,
    publicId: String
  },
  
  // Genre/category
  genre: {
    type: String,
    trim: true,
    default: 'Pop'
  },
  
  // Release year
  releaseYear: {
    type: Number,
    min: [1900, 'Invalid release year'],
    max: [new Date().getFullYear() + 1, 'Release year cannot be in the future']
  },
  
  // Song metadata
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
    playCount: {
      type: Number,
      default: 0,
      min: [0, 'Play count cannot be negative']
    }
  },
  
  // Lyrics (optional, multilingual)
  lyrics: multilingualTextSchema,
  
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
songSchema.index({ key: 1 });
songSchema.index({ 'metadata.isActive': 1 });
songSchema.index({ 'metadata.order': 1 });
songSchema.index({ 'metadata.isFeatured': 1 });
songSchema.index({ genre: 1 });
songSchema.index({ createdAt: -1 });

// Virtual for formatted duration (mm:ss)
songSchema.virtual('formattedDuration').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = Math.floor(this.duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Method to get song for specific language
songSchema.methods.getLocalizedSong = function(language = 'en') {
  const lang = SUPPORTED_LANGUAGES.includes(language) ? language : 'en';
  
  return {
    _id: this._id,
    key: this.key,
    title: this.title?.[lang] || this.title?.en || '',
    description: this.description?.[lang] || this.description?.en || '',
    artist: this.artist?.[lang] || this.artist?.en || '',
    audioUrl: this.audioUrl || '',
    duration: this.duration,
    formattedDuration: this.formattedDuration,
    coverImage: this.coverImage || {},
    genre: this.genre || '',
    releaseYear: this.releaseYear,
    metadata: this.metadata || {},
    lyrics: this.lyrics?.[lang] || this.lyrics?.en || '',
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Static method to get all songs for a language
songSchema.statics.getByLanguage = async function(language = 'en', options = {}) {
  const query = { 'metadata.isActive': true };
  
  if (options.featured) {
    query['metadata.isFeatured'] = true;
  }
  
  if (options.genre) {
    query.genre = options.genre;
  }
  
  const songs = await this.find(query)
    .sort({ 'metadata.order': 1, createdAt: -1 })
    .populate('createdBy', 'name email')
    .populate('lastModifiedBy', 'name email');
  
  return songs.map(song => song.getLocalizedSong(language));
};

// Method to increment play count
songSchema.methods.incrementPlayCount = function() {
  this.metadata.playCount += 1;
  return this.save({ validateBeforeSave: false });
};

// Pre-save middleware
songSchema.pre('save', function(next) {
  // Ensure at least English title exists
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

const Song = mongoose.model('Song', songSchema);

export default Song;
export { SUPPORTED_LANGUAGES };
