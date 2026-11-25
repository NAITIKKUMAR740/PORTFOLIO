const express = require('express');
const authController = require('../controllers/authController');
const { requireAdmin } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimitMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { loginRules } = require('../validators/authValidator');

const router = express.Router();

router.post('/login', authLimiter, loginRules, validate, authController.login);
router.get('/verify', requireAdmin, authController.verify);

module.exports = router;
