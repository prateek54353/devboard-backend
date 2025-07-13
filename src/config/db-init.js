const { sequelize } = require('./database');
const { User } = require('../models/user.model');
const { Todo } = require('../models/todo.model');
const { Streak } = require('../models/streak.model');
const { Challenge, UserChallenge } = require('../models/challenge.model');
const { seedDatabase } = require('./seed-data');

/**
 * Initialize database by syncing all models
 */
const initializeDatabase = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync all models with database
    // In production, you might want to use { alter: true } instead of { force: true }
    // force: true will drop tables if they exist
    const syncOptions = process.env.NODE_ENV === 'production'
      ? { alter: true }
      : { force: process.env.DB_FORCE_SYNC === 'true' };

    await sequelize.sync(syncOptions);
    console.log('Database synchronized successfully.');

    // Seed database with initial data if in development mode
    if (process.env.NODE_ENV !== 'production' && process.env.DB_SEED === 'true') {
      await seedDatabase();
    }

    return true;
  } catch (error) {
    console.error('Unable to initialize database:', error);
    return false;
  }
};

module.exports = {
  initializeDatabase,
};