const { body, param } = require('express-validator');

const SKILL_CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps & Tools', 'Languages', 'Other'];
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const skillIdParamRule = [
  param('id').isMongoId().withMessage('Invalid skill ID format'),
];

const createSkillRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Skill name is required')
    .isLength({ max: 60 })
    .withMessage('Skill name cannot exceed 60 characters'),
  body('category')
    .trim()
    .isIn(SKILL_CATEGORIES)
    .withMessage(`Category must be one of: ${SKILL_CATEGORIES.join(', ')}`),
  body('level')
    .optional()
    .isIn(SKILL_LEVELS)
    .withMessage(`Level must be one of: ${SKILL_LEVELS.join(', ')}`),
  body('proficiency')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Proficiency must be an integer between 1 and 100')
    .toInt(),
  body('icon').optional().trim().isLength({ max: 40 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

const updateSkillRules = [
  ...skillIdParamRule,
  body('name').optional().trim().notEmpty().isLength({ max: 60 }),
  body('category').optional().trim().isIn(SKILL_CATEGORIES),
  body('level').optional().isIn(SKILL_LEVELS),
  body('proficiency').optional().isInt({ min: 1, max: 100 }).toInt(),
  body('icon').optional().trim().isLength({ max: 40 }),
  body('order').optional().isInt({ min: 0 }).toInt(),
];

module.exports = {
  skillIdParamRule,
  createSkillRules,
  updateSkillRules,
};
