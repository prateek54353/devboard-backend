const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const { User } = require('./user.model');

/**
 * Streak model definition
 * Tracks daily coding activity for streak calculations
 */
const Streak = sequelize.define(
  'Streak',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM('github', 'manual'),
      defaultValue: 'manual',
    },
    commitCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    indexes: [
      // Composite index for user and date
      {
        unique: true,
        fields: ['userId', 'date'],
      },
    ],
  }
);

// Define associations
Streak.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Streak, { foreignKey: 'userId', as: 'streaks' });

/**
 * Calculate current streak for a user
 * @param {UUID} userId - User ID
 * @returns {Object} Streak information
 */
Streak.calculateCurrentStreak = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get all streak entries for the user, ordered by date descending
  const streakEntries = await Streak.findAll({
    where: { userId },
    order: [['date', 'DESC']],
  });

  if (streakEntries.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastActiveDate = new Date(streakEntries[0].date);
  
  // Check if the most recent entry is today or yesterday
  const mostRecentDate = new Date(streakEntries[0].date);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isActive = 
    mostRecentDate.getTime() === today.getTime() || 
    mostRecentDate.getTime() === yesterday.getTime();
  
  // Calculate streaks
  let prevDate = null;
  
  for (const entry of streakEntries) {
    const entryDate = new Date(entry.date);
    
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const diffTime = prevDate.getTime() - entryDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak += 1;
      } else {
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
        tempStreak = 1;
      }
    }
    
    prevDate = entryDate;
  }
  
  // Update longest streak if needed
  if (tempStreak > longestStreak) {
    longestStreak = tempStreak;
  }
  
  // Set current streak
  currentStreak = isActive ? tempStreak : 0;
  
  return { currentStreak, longestStreak, lastActiveDate };
};

module.exports = {
  Streak,
};