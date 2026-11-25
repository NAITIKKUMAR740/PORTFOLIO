const { body, param } = require('express-validator');

const contactIdParamRule = [
  param('id').isMongoId().withMessage('Invalid message ID format'),
];

const submitContactRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Subject must be between 3 and 150 characters'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 3000 })
    .withMessage('Message must be between 10 and 3000 characters'),
  // Honeypot anti-spam field: bots often fill hidden 'website' fields
  body('website')
    .optional({ values: 'falsy' })
    .isEmpty()
    .withMessage('Invalid form submission'),
];

const updateContactStatusRules = [
  ...contactIdParamRule,
  body('status')
    .trim()
    .isIn(['new', 'read', 'replied', 'archived'])
    .withMessage('Status must be new, read, replied, or archived'),
];

module.exports = {
  contactIdParamRule,
  submitContactRules,
  updateContactStatusRules,
};
