const Skill = require('../models/Skill');
const ApiError = require('../utils/ApiError');

/**
 * Lists all skills sorted by order and proficiency, optionally filtered by category.
 */
const listSkills = async (filters = {}) => {
  const query = {};
  if (filters.category && filters.category !== 'All') {
    query.category = filters.category;
  }
  return Skill.find(query).sort({ order: 1, proficiency: -1, name: 1 }).lean();
};

/**
 * Groups skills by category for structured frontend consumption.
 */
const listSkillsGrouped = async () => {
  const skills = await listSkills();
  const grouped = {};

  for (const skill of skills) {
    if (!grouped[skill.category]) {
      grouped[skill.category] = [];
    }
    grouped[skill.category].push(skill);
  }

  return grouped;
};

/**
 * Creates a new skill.
 */
const createSkill = async (payload) => {
  const skill = await Skill.create(payload);
  return skill.toObject();
};

/**
 * Updates an existing skill by ID.
 */
const updateSkill = async (id, payload) => {
  const skill = await Skill.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true, runValidators: true }
  ).lean();

  if (!skill) {
    throw new ApiError(404, 'Skill not found');
  }
  return skill;
};

/**
 * Deletes a skill by ID.
 */
const deleteSkill = async (id) => {
  const deleted = await Skill.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(404, 'Skill not found');
  }
  return deleted;
};

module.exports = {
  listSkills,
  listSkillsGrouped,
  createSkill,
  updateSkill,
  deleteSkill,
};
