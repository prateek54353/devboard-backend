const express = require('express');
const githubController = require('../controllers/github.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /github/profile/{username}:
 *   get:
 *     summary: Get GitHub profile by username
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *     responses:
 *       200:
 *         description: GitHub profile retrieved successfully
 *       400:
 *         description: Invalid username format
 *       404:
 *         description: GitHub profile not found
 */
router.get('/profile/:username', githubController.getProfileByUsername);

/**
 * @swagger
 * /github/repos/{username}:
 *   get:
 *     summary: Get GitHub repositories by username
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of repositories to return
 *     responses:
 *       200:
 *         description: GitHub repositories retrieved successfully
 *       400:
 *         description: Invalid username format
 *       404:
 *         description: GitHub profile not found
 */
router.get('/repos/:username', githubController.getRepositoriesByUsername);

/**
 * @swagger
 * /github/pinned/{username}:
 *   get:
 *     summary: Get GitHub pinned repositories by username
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *     responses:
 *       200:
 *         description: GitHub pinned repositories retrieved successfully
 *       400:
 *         description: Invalid username format
 *       404:
 *         description: GitHub profile not found
 */
router.get('/pinned/:username', githubController.getPinnedRepositoriesByUsername);

/**
 * @swagger
 * /github/contributions/{username}:
 *   get:
 *     summary: Get GitHub contribution data by username
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *     responses:
 *       200:
 *         description: GitHub contribution data retrieved successfully
 *       400:
 *         description: Invalid username format
 *       404:
 *         description: GitHub profile not found
 */
router.get('/contributions/:username', githubController.getContributionsByUsername);

/**
 * @swagger
 * /github/comprehensive/{username}:
 *   get:
 *     summary: Get comprehensive GitHub profile data by username
 *     tags: [GitHub]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: GitHub username
 *     responses:
 *       200:
 *         description: Comprehensive GitHub profile data retrieved successfully
 *       400:
 *         description: Invalid username format
 *       404:
 *         description: GitHub profile not found
 */
router.get('/comprehensive/:username', githubController.getComprehensiveProfileByUsername);

/**
 * @swagger
 * /github/me:
 *   get:
 *     summary: Get GitHub data for the authenticated user
 *     tags: [GitHub]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: GitHub data retrieved successfully
 *       400:
 *         description: GitHub username not set in profile
 *       401:
 *         description: Not authenticated
 */
router.get('/me', protect, githubController.getMyGitHubData);

/**
 * @swagger
 * /github/link:
 *   post:
 *     summary: Link GitHub account to user profile
 *     tags: [GitHub]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - githubUsername
 *             properties:
 *               githubUsername:
 *                 type: string
 *               githubToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: GitHub account linked successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 */
router.post('/link', protect, githubController.linkGitHubAccount);

module.exports = router;