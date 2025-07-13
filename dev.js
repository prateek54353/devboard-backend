/**
 * Development server script with enhanced logging and error handling
 */
require('dotenv').config();
const nodemon = require('nodemon');
const path = require('path');

// Set environment variables for development
process.env.NODE_ENV = 'development';

// Configure nodemon
nodemon({
  script: 'server.js',
  ext: 'js,json',
  ignore: ['node_modules/', 'coverage/', '__tests__/'],
  verbose: true,
  watch: [
    'src/',
    'server.js',
    '.env',
  ],
  env: {
    NODE_ENV: 'development',
  },
});

// Log events
nodemon
  .on('start', () => {
    console.log('DevBoard API development server has started');
  })
  .on('quit', () => {
    console.log('DevBoard API development server has quit');
    process.exit();
  })
  .on('restart', (files) => {
    console.log('DevBoard API development server restarted due to:');
    files.forEach(file => console.log(`  ${path.relative(process.cwd(), file)}`));
  })
  .on('crash', () => {
    console.error('DevBoard API development server crashed! Restarting...');
  });