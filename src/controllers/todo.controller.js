const { Todo } = require('../models/todo.model');
const { AppError } = require('../middleware/error.middleware');

/**
 * Get all todos for the authenticated user
 * @route GET /api/v1/todos
 */
const getAllTodos = async (req, res, next) => {
  try {
    const { status, priority, tag, sort, limit = 20, page = 1 } = req.query;
    const userId = req.user.id;

    // Build query conditions
    const where = { userId };
    
    // Filter by status if provided
    if (status) {
      where.status = status;
    }
    
    // Filter by priority if provided
    if (priority) {
      where.priority = priority;
    }
    
    // Filter by tag if provided
    if (tag) {
      where.tags = { [Todo.sequelize.Op.contains]: [tag] };
    }
    
    // Build sort options
    let order = [['createdAt', 'DESC']]; // Default sort
    if (sort) {
      const [field, direction] = sort.split(':');
      if (['title', 'status', 'priority', 'deadline', 'createdAt', 'updatedAt'].includes(field)) {
        order = [[field, direction === 'desc' ? 'DESC' : 'ASC']];
      }
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get todos
    const todos = await Todo.findAndCountAll({
      where,
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    
    res.status(200).json({
      status: 'success',
      results: todos.rows.length,
      total: todos.count,
      page: parseInt(page, 10),
      pages: Math.ceil(todos.count / limit),
      data: {
        todos: todos.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single todo by ID
 * @route GET /api/v1/todos/:id
 */
const getTodoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find todo
    const todo = await Todo.findOne({
      where: { id, userId },
    });
    
    // Check if todo exists
    if (!todo) {
      return next(new AppError('Todo not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        todo,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new todo
 * @route POST /api/v1/todos
 */
const createTodo = async (req, res, next) => {
  try {
    const { title, description, status, priority, tags, deadline } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!title) {
      return next(new AppError('Title is required', 400));
    }
    
    // Create todo
    const todo = await Todo.create({
      title,
      description,
      status,
      priority,
      tags,
      deadline,
      userId,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        todo,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a todo
 * @route PATCH /api/v1/todos/:id
 */
const updateTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, tags, deadline } = req.body;
    const userId = req.user.id;
    
    // Find todo
    const todo = await Todo.findOne({
      where: { id, userId },
    });
    
    // Check if todo exists
    if (!todo) {
      return next(new AppError('Todo not found', 404));
    }
    
    // Update todo
    await todo.update({
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(tags && { tags }),
      ...(deadline !== undefined && { deadline }),
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        todo,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a todo
 * @route DELETE /api/v1/todos/:id
 */
const deleteTodo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find todo
    const todo = await Todo.findOne({
      where: { id, userId },
    });
    
    // Check if todo exists
    if (!todo) {
      return next(new AppError('Todo not found', 404));
    }
    
    // Delete todo
    await todo.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get todo statistics
 * @route GET /api/v1/todos/stats
 */
const getTodoStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get counts by status
    const statusCounts = await Todo.findAll({
      attributes: [
        'status',
        [Todo.sequelize.fn('COUNT', Todo.sequelize.col('id')), 'count'],
      ],
      where: { userId },
      group: ['status'],
    });
    
    // Get counts by priority
    const priorityCounts = await Todo.findAll({
      attributes: [
        'priority',
        [Todo.sequelize.fn('COUNT', Todo.sequelize.col('id')), 'count'],
      ],
      where: { userId },
      group: ['priority'],
    });
    
    // Get upcoming deadlines
    const upcomingDeadlines = await Todo.findAll({
      where: {
        userId,
        deadline: {
          [Todo.sequelize.Op.gte]: new Date(),
        },
        status: {
          [Todo.sequelize.Op.ne]: 'completed',
        },
      },
      order: [['deadline', 'ASC']],
      limit: 5,
    });
    
    // Format status counts
    const formattedStatusCounts = {};
    statusCounts.forEach((item) => {
      formattedStatusCounts[item.status] = parseInt(item.getDataValue('count'), 10);
    });
    
    // Format priority counts
    const formattedPriorityCounts = {};
    priorityCounts.forEach((item) => {
      formattedPriorityCounts[item.priority] = parseInt(item.getDataValue('count'), 10);
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        statusCounts: formattedStatusCounts,
        priorityCounts: formattedPriorityCounts,
        upcomingDeadlines,
        total: await Todo.count({ where: { userId } }),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
  getTodoStats,
};