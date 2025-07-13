const express = require('express');
const streakController = require('../controllers/streak.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /streaks:
 *   get:
 *     summary: Get all streak entries for the authenticated user
 *     tags: [Streaks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: date:desc
 *         description: Sort field and direction (field:asc|desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of items per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Streak entries retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/', streakController.getAllStreaks);

/**
 * @swagger
 * /streaks/stats:
 *   get:
 *     summary: Get streak statistics
 *     tags: [Streaks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Streak statistics retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/stats', streakController.getStreakStats);

/**
 * @swagger
 * /streaks/sync-github:
 *   post:
 *     summary: Sync GitHub contributions to streaks
 *     tags: [Streaks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: GitHub contributions synced successfully
 *       400:
 *         description: GitHub username not set in profile
 *       401:
 *         description: Not authenticated
 */
router.post('/sync-github', streakController.syncGitHubContributions);

/**
 * @swagger
 * /streaks/{id}:
 *   get:
 *     summary: Get a single streak entry by ID
 *     tags: [Streaks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Streak ID
 *     responses:
 *       200:
 *         description: Streak entry retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Streak entry not found
 */
router.get('/:id', streakController.getStreakById);

/**
 * @swagger
 * /streaks:
 *   post:
 *     summary: Create a new streak entry
 *     tags: [Streaks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the streak entry (YYYY-MM-DD)
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *               language:
 *                 type: string
 *                 description: Programming language used
 *               commitCount:
 *                 type: integer
 *                 description: Number of commits
 *                 default: 0
 *     responses:
 *       201:
 *         description: Streak entry created successfully
 *       400:
 *         description: Invalid input or entry already exists for this date
 *       401:
 *         description: Not authenticated
 */
router.post('/', streakController.createStreak);

/**
 * @swagger
 * /streaks/{id}:
 *   patch:
 *     summary: Update a streak entry
 *     tags: [Streaks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Streak ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the streak entry (YYYY-MM-DD)
 *               description:
 *                 type: string
 *                 description: Description of the activity
 *               language:
 *                 type: string
 *                 description: Programming language used
 *               commitCount:
 *                 type: integer
 *                 description: Number of commits
 *     responses:
 *       200:
 *         description: Streak entry updated successfully
 *       400:
 *         description: Invalid input or cannot update GitHub streaks
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Streak entry not found
 */
router.patch('/:id', streakController.updateStreak);

/**
 * @swagger
 * /streaks/{id}:
 *   delete:
 *     summary: Delete a streak entry
 *     tags: [Streaks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Streak ID
 *     responses:
 *       204:
 *         description: Streak entry deleted successfully
 *       400:
 *         description: Cannot delete GitHub streaks
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Streak entry not found
 */
router.delete('/:id', streakController.deleteStreak);

module.exports = router;