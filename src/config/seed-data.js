const bcrypt = require('bcrypt');
const { User } = require('../models/user.model');
const { Todo } = require('../models/todo.model');
const { Streak } = require('../models/streak.model');
const { Challenge } = require('../models/challenge.model');

/**
 * Seed the database with initial data for development
 */
const seedDatabase = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Skipping database seeding in production mode');
      return;
    }

    console.log('Seeding database with initial data...');

    // Create admin user
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@devboard.com',
      password: adminPassword,
      isActive: true,
      lastLogin: new Date(),
    });

    // Create demo user
    const demoPassword = await bcrypt.hash('Demo123!', 10);
    const demoUser = await User.create({
      username: 'demo',
      email: 'demo@devboard.com',
      password: demoPassword,
      githubUsername: 'octocat',
      stackoverflowUserId: '1',
      isActive: true,
      lastLogin: new Date(),
    });

    // Create todos for demo user
    await Todo.bulkCreate([
      {
        title: 'Complete DevBoard API',
        description: 'Finish implementing all endpoints for the DevBoard API',
        status: 'in_progress',
        priority: 'high',
        tags: ['api', 'backend', 'express'],
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        userId: demoUser.id,
      },
      {
        title: 'Write API documentation',
        description: 'Create comprehensive documentation for the DevBoard API',
        status: 'pending',
        priority: 'medium',
        tags: ['documentation', 'swagger'],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        userId: demoUser.id,
      },
      {
        title: 'Set up CI/CD pipeline',
        description: 'Configure GitHub Actions for continuous integration and deployment',
        status: 'pending',
        priority: 'medium',
        tags: ['devops', 'github'],
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        userId: demoUser.id,
      },
    ]);

    // Create streak entries for demo user
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    await Streak.bulkCreate([
      {
        date: today,
        description: 'Worked on DevBoard API',
        language: 'javascript',
        source: 'manual',
        commitCount: 5,
        userId: demoUser.id,
      },
      {
        date: yesterday,
        description: 'Fixed bugs in authentication system',
        language: 'javascript',
        source: 'manual',
        commitCount: 3,
        userId: demoUser.id,
      },
      {
        date: twoDaysAgo,
        description: 'Set up project structure',
        language: 'javascript',
        source: 'manual',
        commitCount: 8,
        userId: demoUser.id,
      },
    ]);

    // Create challenges
    const challenge1 = await Challenge.create({
      title: 'Build a REST API',
      description: 'Create a RESTful API using Express.js with authentication and database integration.',
      difficulty: 'medium',
      language: 'javascript',
      tags: ['api', 'express', 'node'],
      source: 'manual',
      isPublic: true,
      createdBy: adminUser.id,
    });

    const challenge2 = await Challenge.create({
      title: 'Create a React Component Library',
      description: 'Build a reusable component library with React and Storybook.',
      difficulty: 'hard',
      language: 'javascript',
      tags: ['react', 'frontend', 'ui'],
      source: 'manual',
      isPublic: true,
      createdBy: adminUser.id,
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = {
  seedDatabase,
};