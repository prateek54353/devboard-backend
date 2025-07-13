const express = require('express');
const todoController = require('../controllers/todo.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all todos for the authenticated user
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *         description: Filter by status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high]
 *         description: Filter by priority
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: deadline:asc
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
 *         description: Todos retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/', todoController.getAllTodos);

/**
 * @swagger
 * /todos/stats:
 *   get:
 *     summary: Get todo statistics
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todo statistics retrieved successfully
 *       401:
 *         description: Not authenticated
 */
router.get('/stats', todoController.getTodoStats);

/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Get a single todo by ID
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
 *     responses:
 *       200:
 *         description: Todo retrieved successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Todo not found
 */
router.get('/:id', todoController.getTodoById);

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new todo
 *     tags: [Todos]
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *                 default: pending
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 default: medium
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Todo created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 */
router.post('/', todoController.createTodo);

/**
 * @swagger
 * /todos/{id}:
 *   patch:
 *     summary: Update a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
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
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Todo updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Todo not found
 */
router.patch('/:id', todoController.updateTodo);

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Todo ID
 *     responses:
 *       204:
 *         description: Todo deleted successfully
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Todo not found
 */
router.delete('/:id', todoController.deleteTodo);

module.exports = router;