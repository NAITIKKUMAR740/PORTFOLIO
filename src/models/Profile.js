const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
  {
    singletonKey: {
      type: String,
      default: 'primary',
      unique: true,
      immutable: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
    headline: {
      type: String,
      required: [true, 'Headline is required'],
      trim: true,
      maxlength: [140, 'Headline cannot exceed 140 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: [260, 'Tagline cannot exceed 260 characters'],
      default: '',
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
    aboutHighlights: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Location cannot exceed 120 characters'],
      default: 'Remote',
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    availability: {
      type: String,
      enum: ['available', 'open', 'busy'],
      default: 'available',
    },
    availabilityLabel: {
      type: String,
      trim: true,
      maxlength: [120, 'Availability label cannot exceed 120 characters'],
      default: 'Open to Full-Stack Opportunities',
    },
    resumeUrl: {
      type: String,
      trim: true,
      default: '',
    },
    avatarUrl: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      github: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      website: { type: String, trim: true, default: '' },
    },
    stats: {
      projectsCompleted: { type: Number, min: 0, default: 0 },
      yearsExperience: { type: Number, min: 0, default: 0 },
      technologiesCount: { type: Number, min: 0, default: 0 },
      certificationsCount: { type: Number, min: 0, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Profile', profileSchema);
