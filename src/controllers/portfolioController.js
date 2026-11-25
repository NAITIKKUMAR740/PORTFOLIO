const mongoose = require('mongoose');
const profileService = require('../services/profileService');
const projectService = require('../services/projectService');
const skillService = require('../services/skillService');
const asyncHandler = require('../utils/asyncHandler');

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const getHealth = asyncHandler(async (req, res) => {
  const dbState = DB_STATES[mongoose.connection.readyState] || 'unknown';
  res.status(200).json({
    success: true,
    status: 'ok',
    database: dbState,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

const getPortfolioBundle = asyncHandler(async (req, res) => {
  const [profile, projects, skills] = await Promise.all([
    profileService.getProfile(),
    projectService.listProjects(),
    skillService.listSkills(),
  ]);

  const skillsGrouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  res.status(200).json({
    success: true,
    data: {
      profile,
      projects,
      skills,
      skillsGrouped,
    },
  });
});

module.exports = {
  getHealth,
  getPortfolioBundle,
};
