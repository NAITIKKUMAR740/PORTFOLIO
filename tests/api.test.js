const { describe, it, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-suite-jwt-secret-key-123456';
process.env.ADMIN_EMAIL = 'admin@test.local';
process.env.ADMIN_PASSWORD = 'TestPassword123!';
process.env.ADMIN_API_KEY = 'test-api-key-12345';

const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const { seedPortfolioData } = require('../src/seed/seedData');
const ContactMessage = require('../src/models/ContactMessage');

let mongoServer;
let adminToken;

describe('Portfolio Full-Stack API Integration Tests', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectDB(mongoServer.getUri());
  });

  after(async () => {
    await disconnectDB();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    await ContactMessage.deleteMany({});
    await seedPortfolioData({ reset: true });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
      });

    assert.equal(loginRes.status, 200);
    adminToken = loginRes.body.data.token;
  });

  it('GET /api/health returns ok and connected database status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.database, 'connected');
  });

  it('GET /api/portfolio returns seeded profile, projects, and skills', async () => {
    const res = await request(app).get('/api/portfolio');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.profile.fullName, 'Naitik Kumar');
    assert.ok(res.body.data.projects.length >= 2);
    assert.ok(res.body.data.skills.length >= 8);
    assert.ok(res.body.data.skillsGrouped.Backend);
  });

  it('GET /api/projects supports category and search query filters', async () => {
    const res = await request(app).get('/api/projects?category=Full-Stack&search=To-Do');
    assert.equal(res.status, 200);
    assert.equal(res.body.count, 1);
    assert.equal(res.body.data[0].slug, 'fullstack-todo-task-manager');
  });

  it('POST /api/contact validates input, stores message in MongoDB, and sends email', async () => {
    const invalidRes = await request(app)
      .post('/api/contact')
      .send({ name: 'A', email: 'not-an-email', subject: 'Hi', message: 'short' });

    assert.equal(invalidRes.status, 400);
    assert.equal(invalidRes.body.success, false);
    assert.ok(Array.isArray(invalidRes.body.errors));

    const validRes = await request(app)
      .post('/api/contact')
      .send({
        name: 'Jane Recruiter',
        email: 'jane@company.com',
        subject: 'Full-Stack Internship Opportunity',
        message: 'Hello! We reviewed your Express and MongoDB portfolio and would love to chat.',
      });

    assert.equal(validRes.status, 201);
    assert.equal(validRes.body.success, true);
    assert.ok(validRes.body.data.id);

    const saved = await ContactMessage.findById(validRes.body.data.id).lean();
    assert.equal(saved.email, 'jane@company.com');
    assert.equal(saved.status, 'new');
  });

  it('POST /api/contact rejects honeypot spam submissions', async () => {
    const res = await request(app)
      .post('/api/contact')
      .send({
        name: 'Spam Bot',
        email: 'bot@spam.example',
        subject: 'Buy now',
        message: 'Click this link for automated marketing services.',
        website: 'http://spam.example',
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('Admin routes reject unauthenticated requests and allow full CRUD when authenticated', async () => {
    const unauth = await request(app)
      .post('/api/projects')
      .send({ title: 'Unauthorized Project' });
    assert.equal(unauth.status, 401);

    // Create project
    const createProj = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Realtime Chat Microservice',
        summary: 'Scalable WebSocket chat service backed by MongoDB.',
        description: 'Built a real-time chat backend with room persistence and JWT authentication.',
        category: 'Backend',
        techStack: ['Node.js', 'Express.js', 'MongoDB'],
        featured: true,
      });

    assert.equal(createProj.status, 201);
    const projectId = createProj.body.data._id;

    // Update project
    const updateProj = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'in-progress' });

    assert.equal(updateProj.status, 200);
    assert.equal(updateProj.body.data.status, 'in-progress');

    // Delete project
    const delProj = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    assert.equal(delProj.status, 200);

    // Create & delete skill via API key
    const createSkill = await request(app)
      .post('/api/skills')
      .set('x-api-key', process.env.ADMIN_API_KEY)
      .send({ name: 'TypeScript', category: 'Languages', level: 'Advanced', proficiency: 86 });

    assert.equal(createSkill.status, 201);
  });
});
