const profileService = require('../services/profileService');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile();
  res.status(200).json({
    success: true,
    data: profile,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.upsertProfile(req.body);
  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: profile,
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
