const Profile = require('../models/Profile');
const ApiError = require('../utils/ApiError');

/**
 * Retrieves the primary portfolio profile.
 * Returns null if not yet seeded so callers can handle gracefully.
 */
const getProfile = async () => {
  return Profile.findOne({ singletonKey: 'primary' }).lean();
};

/**
 * Updates (or upserts) the primary portfolio profile.
 * @param {Object} payload
 */
const upsertProfile = async (payload) => {
  const allowedFields = [
    'fullName',
    'headline',
    'tagline',
    'bio',
    'aboutHighlights',
    'location',
    'email',
    'availability',
    'availabilityLabel',
    'resumeUrl',
    'avatarUrl',
    'socialLinks',
    'stats',
  ];

  const updateData = {};
  for (const field of allowedFields) {
    if (payload[field] !== undefined) {
      updateData[field] = payload[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(400, 'No valid profile fields provided for update');
  }

  const profile = await Profile.findOneAndUpdate(
    { singletonKey: 'primary' },
    { $set: updateData, $setOnInsert: { singletonKey: 'primary' } },
    { new: true, upsert: true, runValidators: true }
  ).lean();

  return profile;
};

module.exports = {
  getProfile,
  upsertProfile,
};
