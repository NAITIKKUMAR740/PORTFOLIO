const projectService = require('../services/projectService');
const asyncHandler = require('../utils/asyncHandler');

const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects({
    category: req.query.category,
    featured: req.query.featured,
    status: req.query.status,
    search: req.query.search,
  });

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
});

const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectByIdOrSlug(req.params.idOrSlug);
  res.status(200).json({
    success: true,
    data: project,
  });
});

const createProject = asyncHandler(async (req, res) => {
  const project = await projectService.createProject(req.body);
  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: project,
  });
});

const updateProject = asyncHandler(async (req, res) => {
  const project = await projectService.updateProject(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Project updated successfully',
    data: project,
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  await projectService.deleteProject(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Project deleted successfully',
  });
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};
