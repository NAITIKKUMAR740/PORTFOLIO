const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const profileRoutes = require('./profileRoutes');
const projectRoutes = require('./projectRoutes');
const skillRoutes = require('./skillRoutes');
const contactRoutes = require('./contactRoutes');
const authRoutes = require('./authRoutes');

const router = express.Router();

router.get('/health', portfolioController.getHealth);
router.get('/portfolio', portfolioController.getPortfolioBundle);

router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', skillRoutes);
router.use('/contact', contactRoutes);
router.use('/auth', authRoutes);

module.exports = router;
