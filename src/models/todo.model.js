const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./user.model');

/**
 * Todo model definition
 */
const Todo = sequelize.define(
  'Todo',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      defaultValue: 'medium',
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Define associations
Todo.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Todo, { foreignKey: 'userId', as: 'todos' });

module.exports = {
  Todo,
};