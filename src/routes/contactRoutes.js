const express = require('express');
const contactController = require('../controllers/contactController');
const { requireAdmin } = require('../middlewares/authMiddleware');
const { contactLimiter } = require('../middlewares/rateLimitMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  contactIdParamRule,
  submitContactRules,
  updateContactStatusRules,
} = require('../validators/contactValidator');

const router = express.Router();

router.post('/', contactLimiter, submitContactRules, validate, contactController.submitContact);
router.get('/', requireAdmin, contactController.listMessages);
router.patch(
  '/:id/status',
  requireAdmin,
  updateContactStatusRules,
  validate,
  contactController.updateMessageStatus
);
router.delete('/:id', requireAdmin, contactIdParamRule, validate, contactController.deleteMessage);

module.exports = router;
