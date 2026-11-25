const express = require('express');
const projectController = require('../controllers/projectController');
const { requireAdmin } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const {
  projectIdParamRule,
  createProjectRules,
  updateProjectRules,
} = require('../validators/projectValidator');

const router = express.Router();

router.get('/', projectController.listProjects);
router.get('/:idOrSlug', projectController.getProject);
router.post('/', requireAdmin, createProjectRules, validate, projectController.createProject);
router.put('/:id', requireAdmin, updateProjectRules, validate, projectController.updateProject);
router.delete('/:id', requireAdmin, projectIdParamRule, validate, projectController.deleteProject);

module.exports = router;
