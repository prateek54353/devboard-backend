const express = require('express');
const stackoverflowController = require('../controllers/stackoverflow.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /stackoverflow/profile/{userId}:
 *   get:
 *     summary: Get StackOverflow profile by user ID
 *     tags: [StackOverflow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: StackOverflow user ID
 *     responses:
 *       200:
 *         description: StackOverflow profile retrieved successfully
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: StackOverflow profile not found
 */
router.get('/profile/:userId', stackoverflowController.getProfileByUserId);

/**
 * @swagger
 * /stackoverflow/questions/{userId}:
 *   get:
 *     summary: Get StackOverflow questions by user ID
 *     tags: [StackOverflow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: StackOverflow user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: StackOverflow questions retrieved successfully
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: StackOverflow profile not found
 */
router.get('/questions/:userId', stackoverflowController.getQuestionsByUserId);

/**
 * @swagger
 * /stackoverflow/answers/{userId}:
 *   get:
 *     summary: Get StackOverflow answers by user ID
 *     tags: [StackOverflow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: StackOverflow user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: StackOverflow answers retrieved successfully
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: StackOverflow profile not found
 */
router.get('/answers/:userId', stackoverflowController.getAnswersByUserId);

/**
 * @swagger
 * /stackoverflow/top-tags/{userId}:
 *   get:
 *     summary: Get StackOverflow top tags by user ID
 *     tags: [StackOverflow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: StackOverflow user ID
 *     responses:
 *       200:
 *         description: StackOverflow top tags retrieved successfully
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: StackOverflow profile not found
 */
router.get('/top-tags/:userId', stackoverflowController.getTopTagsByUserId);

/**
 * @swagger
 * /stackoverflow/comprehensive/{userId}:
 *   get:
 *     summary: Get comprehensive StackOverflow profile data by user ID
 *     tags: [StackOverflow]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: StackOverflow user ID
 *     responses:
 *       200:
 *         description: Comprehensive StackOverflow profile data retrieved successfully
 *       400:
 *         description: Invalid user ID format
 *       404:
 *         description: StackOverflow profile not found
 */
router.get('/comprehensive/:userId', stackoverflowController.getComprehensiveProfileByUserId);

/**
 * @swagger
 * /stackoverflow/me:
 *   get:
 *     summary: Get StackOverflow data for the authenticated user
 *     tags: [StackOverflow]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: StackOverflow data retrieved successfully
 *       400:
 *         description: StackOverflow user ID not set in profile
 *       401:
 *         description: Not authenticated
 */
router.get('/me', protect, stackoverflowController.getMyStackOverflowData);

/**
 * @swagger
 * /stackoverflow/link:
 *   post:
 *     summary: Link StackOverflow account to user profile
 *     tags: [StackOverflow]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stackoverflowUserId
 *             properties:
 *               stackoverflowUserId:
 *                 type: string
 *     responses:
 *       200:
 *         description: StackOverflow account linked successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 */
router.post('/link', protect, stackoverflowController.linkStackOverflowAccount);

module.exports = router;