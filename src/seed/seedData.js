const { connectDB, disconnectDB } = require('../config/db');
const Profile = require('../models/Profile');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const logger = require('../utils/logger');

const DEFAULT_PROFILE = {
  singletonKey: 'primary',
  fullName: 'Naitik Kumar',
  headline: 'Full-Stack Web Developer',
  tagline:
    'Building mobile-first web interfaces with HTML, CSS & JavaScript and scalable backends with Node.js, Express.js & MongoDB.',
  bio:
    'Hi, I am Naitik Kumar, a Full-Stack Web Developer focused on designing and building end-to-end web applications using HTML, CSS, JavaScript, Node.js, Express.js, and MongoDB.\n\nI prioritize clean MVC layered architecture, secure RESTful APIs, reliable database validation, and responsive user experiences built for production.',
  aboutHighlights: [
    'Layered MVC architecture separating controllers, services, validators, and Mongoose models',
    'RESTful APIs with JWT authentication, input validation, and Helmet/CORS security',
    'Responsive mobile-first frontend with dark/light theme support and live search/filtering',
    'Server-side Nodemailer email integration with database-backed contact management',
  ],
  location: 'Available Remote',
  email: 'naitikpunia2003@gmail.com',
  availability: 'available',
  availabilityLabel: 'Open to Full-Stack Opportunities',
  resumeUrl: '',
  socialLinks: {
    github: 'https://github.com/NAITIKKUMAR740',
    linkedin: '',
    website: '',
  },
  stats: {
    projectsCompleted: 2,
    yearsExperience: 1,
    technologiesCount: 9,
    certificationsCount: 1,
  },
};

const DEFAULT_SKILLS = [
  { name: 'HTML5 & Semantic Markup', category: 'Frontend', level: 'Expert', proficiency: 95, order: 1 },
  { name: 'CSS3 / Responsive Grid & Flex', category: 'Frontend', level: 'Advanced', proficiency: 90, order: 2 },
  { name: 'JavaScript (ES6+ & Fetch API)', category: 'Frontend', level: 'Advanced', proficiency: 90, order: 3 },
  { name: 'Node.js', category: 'Backend', level: 'Advanced', proficiency: 88, order: 4 },
  { name: 'Express.js (MVC & REST APIs)', category: 'Backend', level: 'Advanced', proficiency: 90, order: 5 },
  { name: 'JWT Auth & Input Validation', category: 'Backend', level: 'Advanced', proficiency: 85, order: 6 },
  { name: 'Nodemailer Email Integration', category: 'Backend', level: 'Intermediate', proficiency: 82, order: 7 },
  { name: 'MongoDB & Mongoose ODM', category: 'Database', level: 'Advanced', proficiency: 88, order: 8 },
  { name: 'Git, GitHub & Docker', category: 'DevOps & Tools', level: 'Intermediate', proficiency: 82, order: 9 },
];

const DEFAULT_PROJECTS = [
  {
    title: 'Full-Stack Personal Portfolio Website',
    slug: 'fullstack-personal-portfolio-website',
    summary:
      'Backend-driven portfolio with MVC Express APIs, MongoDB persistence, JWT admin portal, and Nodemailer contact pipeline.',
    description:
      'A production-ready full-stack personal portfolio built with vanilla HTML, CSS, and JavaScript on the frontend and Node.js, Express.js, and MongoDB on the backend. Features dynamic profile, skills, and projects loading, live filtering and search, a protected /admin CMS portal, and server-side validated contact form submissions with email notifications.',
    category: 'Full-Stack',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Nodemailer'],
    highlights: [
      'Clean MVC + Service + Validator layered architecture',
      'JWT & API-key protected Admin CMS for live content updates',
      'Rate-limited contact endpoint with honeypot spam check and email delivery',
    ],
    repoUrl: 'https://github.com/NAITIKKUMAR740',
    liveUrl: '',
    featured: true,
    status: 'completed',
    order: 1,
  },
  {
    title: 'Full-Stack To-Do & Task Manager',
    slug: 'fullstack-todo-task-manager',
    summary:
      'Responsive task management web application with RESTful CRUD APIs, status filtering, and MongoDB persistence.',
    description:
      'Built a full-stack To-Do and productivity application enabling users to create, prioritize, update, complete, and delete tasks in real time. Powered by Node.js, Express.js REST endpoints, Mongoose schema validation, and a responsive mobile-first HTML/CSS/JavaScript interface.',
    category: 'Full-Stack',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'Node.js', 'Express.js', 'MongoDB'],
    highlights: [
      'Full RESTful CRUD lifecycle (Create, Read, Update, Toggle, Delete)',
      'Backend request validation and structured error handling',
      'Mobile-first UI with status filters (All, Active, Completed)',
    ],
    repoUrl: 'https://github.com/NAITIKKUMAR740',
    liveUrl: '',
    featured: true,
    status: 'completed',
    order: 2,
  },
];

const seedPortfolioData = async ({ reset = false } = {}) => {
  if (reset) {
    await Promise.all([
      Profile.deleteMany({}),
      Skill.deleteMany({}),
      Project.deleteMany({}),
    ]);
  }

  const existingProfile = await Profile.findOne({ singletonKey: 'primary' });
  if (!existingProfile) {
    await Profile.create(DEFAULT_PROFILE);
  }

  const skillCount = await Skill.countDocuments();
  if (skillCount === 0) {
    await Skill.insertMany(DEFAULT_SKILLS);
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.create(DEFAULT_PROJECTS);
  }

  return {
    profileSeeded: !existingProfile || reset,
    skillsCount: await Skill.countDocuments(),
    projectsCount: await Project.countDocuments(),
  };
};

if (require.main === module) {
  const reset = process.argv.includes('--reset');
  (async () => {
    try {
      await connectDB();
      const summary = await seedPortfolioData({ reset });
      logger.info('Database seed complete', { reset, ...summary });
      await disconnectDB();
      process.exit(0);
    } catch (err) {
      logger.error('Database seed failed', { message: err.message });
      await disconnectDB();
      process.exit(1);
    }
  })();
}

module.exports = {
  seedPortfolioData,
  DEFAULT_PROFILE,
  DEFAULT_SKILLS,
  DEFAULT_PROJECTS,
};
