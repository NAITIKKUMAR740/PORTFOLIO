const Project = require('../models/Project');
const ApiError = require('../utils/ApiError');

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Lists projects with optional filtering by category, featured, status, or search term.
 */
const listProjects = async (filters = {}) => {
  const query = {};

  if (filters.category && filters.category !== 'All') {
    query.category = filters.category;
  }

  if (filters.featured !== undefined) {
    query.featured = filters.featured === 'true' || filters.featured === true;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.search && filters.search.trim()) {
    const regex = new RegExp(escapeRegex(filters.search.trim()), 'i');
    query.$or = [
      { title: regex },
      { summary: regex },
      { description: regex },
      { techStack: regex },
    ];
  }

  return Project.find(query)
    .sort({ featured: -1, order: 1, createdAt: -1 })
    .lean();
};

/**
 * Fetches a single project by MongoDB ID or slug.
 */
const getProjectByIdOrSlug = async (idOrSlug) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug.toLowerCase() };
  const project = await Project.findOne(query).lean();

  if (!project) {
    throw new ApiError(404, 'Project not found');
  }
  return project;
};

/**
 * Creates a new project.
 */
const createProject = async (payload) => {
  const project = await Project.create(payload);
  return project.toObject();
};

/**
 * Updates an existing project by ID.
 */
const updateProject = async (id, payload) => {
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const updatable = [
    'title',
    'slug',
    'summary',
    'description',
    'category',
    'techStack',
    'highlights',
    'repoUrl',
    'liveUrl',
    'imageUrl',
    'featured',
    'status',
    'order',
  ];

  for (const field of updatable) {
    if (payload[field] !== undefined) {
      project[field] = payload[field];
    }
  }

  await project.save();
  return project.toObject();
};

/**
 * Deletes a project by ID.
 */
const deleteProject = async (id) => {
  const deleted = await Project.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(404, 'Project not found');
  }
  return deleted;
};

module.exports = {
  listProjects,
  getProjectByIdOrSlug,
  createProject,
  updateProject,
  deleteProject,
};
