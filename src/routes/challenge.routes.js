const express = require('express');
const challengeController = require('../controllers/challenge.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /challenges:
 *   get:
 *     summary: Get all challenges
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: string
 *           enum: [easy, medium, hard]
 *         description: Filter by difficulty
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by programming language
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Filter by public/private status
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: createdAt:desc
 *         description: Sort field and direction (field:asc|desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Challenges retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/', challengeController.getAllChallenges);

/**
 * @swagger
 * /challenges/daily:
 *   get:
 *     summary: Get or generate daily challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Preferred programming language
 *     responses:
 *       200:
 *         description: Daily challenge retrieved successfully
 *       201:
 *         description: New daily challenge generated successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/daily', challengeController.getDailyChallenge);

/**
 * @swagger
 * /challenges/weekly:
 *   get:
 *     summary: Get or generate weekly challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Preferred programming language
 *     responses:
 *       200:
 *         description: Weekly challenge retrieved successfully
 *       201:
 *         description: New weekly challenge generated successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/weekly', challengeController.getWeeklyChallenge);

/**
 * @swagger
 * /challenges/generate:
 *   post:
 *     summary: Generate a new AI challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 default: medium
 *               language:
 *                 type: string
 *                 default: javascript
 *               topic:
 *                 type: string
 *                 description: Challenge topic
 *     responses:
 *       201:
 *         description: Challenge generated successfully
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Failed to generate challenge
 */
router.post('/generate', challengeController.generateChallenge);

/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     summary: Get a single challenge by ID
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Challenge ID
 *     responses:
 *       200:
 *         description: Challenge retrieved successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this challenge
 *       404:
 *         description: Challenge not found
 */
router.get('/:id', challengeController.getChallengeById);

/**
 * @swagger
 * /challenges:
 *   post:
 *     summary: Create a new challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 default: medium
 *               language:
 *                 type: string
 *                 default: javascript
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Challenge created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 */
router.post('/', challengeController.createChallenge);

/**
 * @swagger
 * /challenges/{id}:
 *   patch:
 *     summary: Update a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Challenge ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *               language:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Challenge updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to update this challenge
 *       404:
 *         description: Challenge not found
 */
router.patch('/:id', challengeController.updateChallenge);

/**
 * @swagger
 * /challenges/{id}:
 *   delete:
 *     summary: Delete a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Challenge ID
 *     responses:
 *       204:
 *         description: Challenge deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to delete this challenge
 *       404:
 *         description: Challenge not found
 */
router.delete('/:id', challengeController.deleteChallenge);

/**
 * @swagger
 * /challenges/{id}/progress:
 *   post:
 *     summary: Update user's progress on a challenge
 *     tags: [Challenges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Challenge ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [not_started, in_progress, completed, skipped]
 *               solution:
 *                 type: string
 *                 description: User's solution to the challenge
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized to access this challenge
 *       404:
 *         description: Challenge not found
 */
router.post('/:id/progress', challengeController.updateChallengeProgress);

module.exports = router;