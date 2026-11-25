const { body } = require('express-validator');

const optionalUrl = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${field} must be a valid http(s) URL`);

const updateProfileRules = [
  body('fullName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Full name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  body('headline')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Headline cannot be empty')
    .isLength({ max: 140 })
    .withMessage('Headline cannot exceed 140 characters'),
  body('tagline')
    .optional()
    .trim()
    .isLength({ max: 260 })
    .withMessage('Tagline cannot exceed 260 characters'),
  body('bio')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Bio cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Bio cannot exceed 2000 characters'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Location cannot exceed 120 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('availability')
    .optional()
    .isIn(['available', 'open', 'busy'])
    .withMessage('Availability must be available, open, or busy'),
  body('availabilityLabel')
    .optional()
    .trim()
    .isLength({ max: 120 })
    .withMessage('Availability label cannot exceed 120 characters'),
  optionalUrl('resumeUrl'),
  optionalUrl('avatarUrl'),
  optionalUrl('socialLinks.github'),
  optionalUrl('socialLinks.linkedin'),
  optionalUrl('socialLinks.twitter'),
  optionalUrl('socialLinks.website'),
  body('aboutHighlights')
    .optional()
    .isArray()
    .withMessage('aboutHighlights must be an array of strings'),
  body('aboutHighlights.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Each highlight must be between 1 and 200 characters'),
  body('stats.projectsCompleted').optional().isInt({ min: 0 }).toInt(),
  body('stats.yearsExperience').optional().isFloat({ min: 0 }).toFloat(),
  body('stats.technologiesCount').optional().isInt({ min: 0 }).toInt(),
  body('stats.certificationsCount').optional().isInt({ min: 0 }).toInt(),
];

module.exports = { updateProfileRules };
