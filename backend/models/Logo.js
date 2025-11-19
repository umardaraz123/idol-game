import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema({
  logoUrl: {
    type: String,
    required: true,
    trim: true
  },
  altText: {
    type: String,
    default: 'IDOL BE Logo',
    trim: true
  },
  width: {
    type: Number,
    default: 120
  },
  height: {
    type: Number,
    default: 40
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Logo = mongoose.model('Logo', logoSchema);

export default Logo;
