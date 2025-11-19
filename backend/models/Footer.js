import mongoose from 'mongoose';

const multilingualTextSchema = new mongoose.Schema({
  en: { type: String, default: '' },
  hi: { type: String, default: '' },
  ru: { type: String, default: '' },
  ko: { type: String, default: '' },
  zh: { type: String, default: '' },
  ja: { type: String, default: '' },
  es: { type: String, default: '' }
}, { _id: false });

const socialIconSchema = new mongoose.Schema({
  platform: { 
    type: String, 
    required: true,
    trim: true
  },
  url: { 
    type: String, 
    required: true,
    trim: true
  },
  iconUrl: { 
    type: String, 
    required: true,
    trim: true
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const footerSchema = new mongoose.Schema({
  // Left Column
  leftColumn: {
    title: multilingualTextSchema,
    subtitle: multilingualTextSchema,
    description: multilingualTextSchema
  },

  // Center Column
  centerColumn: {
    title: multilingualTextSchema,
    subtitle: multilingualTextSchema,
    description: multilingualTextSchema
  },

  // Right Column
  rightColumn: {
    title: multilingualTextSchema,
    subtitle: multilingualTextSchema,
    description: multilingualTextSchema
  },

  // Social Icons
  socialIcons: [socialIconSchema],

  // Copyright Text
  copyrightText: multilingualTextSchema,

  // Metadata
  metadata: {
    isActive: {
      type: Boolean,
      default: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Method to get localized footer data
footerSchema.methods.getLocalizedFooter = function(lang = 'en') {
  return {
    _id: this._id,
    leftColumn: {
      title: this.leftColumn.title[lang] || this.leftColumn.title.en,
      subtitle: this.leftColumn.subtitle[lang] || this.leftColumn.subtitle.en,
      description: this.leftColumn.description[lang] || this.leftColumn.description.en
    },
    centerColumn: {
      title: this.centerColumn.title[lang] || this.centerColumn.title.en,
      subtitle: this.centerColumn.subtitle[lang] || this.centerColumn.subtitle.en,
      description: this.centerColumn.description[lang] || this.centerColumn.description.en
    },
    rightColumn: {
      title: this.rightColumn.title[lang] || this.rightColumn.title.en,
      subtitle: this.rightColumn.subtitle[lang] || this.rightColumn.subtitle.en,
      description: this.rightColumn.description[lang] || this.rightColumn.description.en
    },
    socialIcons: this.socialIcons.filter(icon => icon.isActive).sort((a, b) => a.order - b.order),
    copyrightText: this.copyrightText[lang] || this.copyrightText.en,
    metadata: this.metadata
  };
};

const Footer = mongoose.model('Footer', footerSchema);

export default Footer;
