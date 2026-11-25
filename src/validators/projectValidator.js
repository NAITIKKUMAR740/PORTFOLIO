const { body, param } = require('express-validator');

const CATEGORIES = ['Full-Stack', 'Backend', 'Frontend', 'API', 'DevOps', 'Other'];
const STATUSES = ['completed', 'in-progress', 'archived'];

const optionalUrl = (field) =>
  body(field)
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ protocols: ['http', 'https'], require_protocol: true })
    .withMessage(`${field} must be a valid http(s) URL`);

const projectIdParamRule = [
  param('id').isMongoId().withMessage('Invalid project ID format'),
];

const createProjectRules = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Project title is required')
    .isLength({ max: 120 })
    .withMessage('Title cannot exceed 120 characters'),
  body('slug')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[a-z0-9-]+$/i)
    .withMessage('Slug can only contain letters, numbers, and hyphens'),
  body('summary')
    .trim()
    .notEmpty()
    .withMessage('Summary is required')
    .isLength({ max: 300 })
    .withMessage('Summary cannot exceed 300 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 3000 })
    .withMessage('Description cannot exceed 3000 characters'),
  body('category')
    .trim()
    .isIn(CATEGORIES)
    .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('techStack')
    .isArray({ min: 1 })
    .withMessage('techStack must be a non-empty array of strings'),
  body('techStack.*')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Each technology name must be non-empty'),
  body('highlights')
    .optional()
    .isArray()
    .withMessage('highlights must be an array of strings'),
  body('highlights.*')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 240 }),
  optionalUrl('repoUrl'),
  optionalUrl('liveUrl'),
  optionalUrl('imageUrl'),
  body('featured').optional().isBoolean().toBoolean(),
  body('status').optional().isIn(STATUSES).withMessage(`Status must be one of: ${STATUSES.join(', ')}`),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

const updateProjectRules = [
  ...projectIdParamRule,
  body('title').optional().trim().notEmpty().isLength({ max: 120 }),
  body('slug')
    .optional({ values: 'falsy' })
    .trim()
    .matches(/^[a-z0-9-]+$/i),
  body('summary').optional().trim().notEmpty().isLength({ max: 300 }),
  body('description').optional().trim().notEmpty().isLength({ max: 3000 }),
  body('category').optional().trim().isIn(CATEGORIES),
  body('techStack').optional().isArray({ min: 1 }),
  body('techStack.*').optional().isString().trim().notEmpty(),
  body('highlights').optional().isArray(),
  body('highlights.*').optional().isString().trim().isLength({ min: 1, max: 240 }),
  optionalUrl('repoUrl'),
  optionalUrl('liveUrl'),
  optionalUrl('imageUrl'),
  body('featured').optional().isBoolean().toBoolean(),
  body('status').optional().isIn(STATUSES),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

module.exports = {
  projectIdParamRule,
  createProjectRules,
  updateProjectRules,
};
