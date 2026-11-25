const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginAdmin(req.body.email, req.body.password);
  res.status(200).json({
    success: true,
    message: 'Authenticated successfully',
    data: result,
  });
});

const verify = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      admin: req.admin,
    },
  });
});

module.exports = {
  login,
  verify,
};
