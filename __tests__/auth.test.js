const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models/user.model');
const { sequelize } = require('../src/config/database');

// Mock the database connection and models
jest.mock('../src/config/database', () => {
  const SequelizeMock = require('sequelize-mock');
  const dbMock = new SequelizeMock();
  return {
    sequelize: dbMock,
    testConnection: jest.fn().mockResolvedValue(true),
  };
});

// Mock the User model
jest.mock('../src/models/user.model', () => {
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    comparePassword: jest.fn().mockResolvedValue(true),
    updateLastLogin: jest.fn().mockResolvedValue(true),
  };

  return {
    User: {
      findOne: jest.fn().mockResolvedValue(mockUser),
      create: jest.fn().mockResolvedValue(mockUser),
      findByPk: jest.fn().mockResolvedValue(mockUser),
      sequelize: {
        Op: {
          or: Symbol('or'),
        },
      },
    },
  };
});

// Mock JWT utility
jest.mock('../src/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-token'),
  verifyToken: jest.fn().mockReturnValue({ id: '123e4567-e89b-12d3-a456-426614174000' }),
}));

describe('Auth Controller', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('data.user');
      expect(res.body.data.user.username).toEqual('testuser');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          // Missing email and password
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login a user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('data.user');
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          // Missing email and password
        });

      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should get the current user profile', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer mock-token');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('data.user');
      expect(res.body.data.user.username).toEqual('testuser');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.statusCode).toEqual(401);
    });
  });
});