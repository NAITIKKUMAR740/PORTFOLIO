const express = require('express');
const skillController = require('../controllers/skillController');
const { requireAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  skillIdParamRule,
  createSkillRules,
  updateSkillRules,
} = require('../validators/skillValidator');

const router = express.Router();

router.get('/', skillController.listSkills);
router.post('/', requireAdmin, createSkillRules, validate, skillController.createSkill);
router.put('/:id', requireAdmin, updateSkillRules, validate, skillController.updateSkill);
router.delete('/:id', requireAdmin, skillIdParamRule, validate, skillController.deleteSkill);

module.exports = router;
