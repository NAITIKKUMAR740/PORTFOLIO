const skillService = require('../services/skillService');
const asyncHandler = require('../utils/asyncHandler');

const listSkills = asyncHandler(async (req, res) => {
  if (req.query.grouped === 'true') {
    const grouped = await skillService.listSkillsGrouped();
    return res.status(200).json({
      success: true,
      data: grouped,
    });
  }

  const skills = await skillService.listSkills({
    category: req.query.category,
  });

  return res.status(200).json({
    success: true,
    count: skills.length,
    data: skills,
  });
});

const createSkill = asyncHandler(async (req, res) => {
  const skill = await skillService.createSkill(req.body);
  res.status(201).json({
    success: true,
    message: 'Skill created successfully',
    data: skill,
  });
});

const updateSkill = asyncHandler(async (req, res) => {
  const skill = await skillService.updateSkill(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Skill updated successfully',
    data: skill,
  });
});

const deleteSkill = asyncHandler(async (req, res) => {
  await skillService.deleteSkill(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully',
  });
});

module.exports = {
  listSkills,
  createSkill,
  updateSkill,
  deleteSkill,
};
