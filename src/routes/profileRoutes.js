const express = require('express');
const profileController = require('../controllers/profileController');
const { requireAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { updateProfileRules } = require('../validators/profileValidator');

const router = express.Router();

router.get('/', profileController.getProfile);
router.put('/', requireAdmin, updateProfileRules, validate, profileController.updateProfile);

module.exports = router;
