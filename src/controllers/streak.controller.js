const { Streak } = require('../models/streak.model');
const { AppError } = require('../middleware/error.middleware');
const githubService = require('../services/github.service');

/**
 * Get all streak entries for the authenticated user
 * @route GET /api/v1/streaks
 */
const getAllStreaks = async (req, res, next) => {
  try {
    const { startDate, endDate, sort, limit = 30, page = 1 } = req.query;
    const userId = req.user.id;

    // Build query conditions
    const where = { userId };
    
    // Filter by date range if provided
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date[Streak.sequelize.Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.date[Streak.sequelize.Op.lte] = new Date(endDate);
      }
    }
    
    // Build sort options
    let order = [['date', 'DESC']]; // Default sort
    if (sort) {
      const [field, direction] = sort.split(':');
      if (['date', 'language', 'commitCount', 'createdAt'].includes(field)) {
        order = [[field, direction === 'desc' ? 'DESC' : 'ASC']];
      }
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get streaks
    const streaks = await Streak.findAndCountAll({
      where,
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    
    res.status(200).json({
      status: 'success',
      results: streaks.rows.length,
      total: streaks.count,
      page: parseInt(page, 10),
      pages: Math.ceil(streaks.count / limit),
      data: {
        streaks: streaks.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single streak entry by ID
 * @route GET /api/v1/streaks/:id
 */
const getStreakById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find streak
    const streak = await Streak.findOne({
      where: { id, userId },
    });
    
    // Check if streak exists
    if (!streak) {
      return next(new AppError('Streak entry not found', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new streak entry
 * @route POST /api/v1/streaks
 */
const createStreak = async (req, res, next) => {
  try {
    const { date, description, language, commitCount } = req.body;
    const userId = req.user.id;
    
    // Validate required fields
    if (!date) {
      return next(new AppError('Date is required', 400));
    }
    
    // Check if streak entry already exists for this date
    const existingStreak = await Streak.findOne({
      where: {
        userId,
        date: new Date(date),
      },
    });
    
    if (existingStreak) {
      return next(
        new AppError('A streak entry already exists for this date', 400)
      );
    }
    
    // Create streak entry
    const streak = await Streak.create({
      date: new Date(date),
      description,
      language,
      source: 'manual',
      commitCount: commitCount || 0,
      userId,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a streak entry
 * @route PATCH /api/v1/streaks/:id
 */
const updateStreak = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, language, commitCount } = req.body;
    const userId = req.user.id;
    
    // Find streak
    const streak = await Streak.findOne({
      where: { id, userId },
    });
    
    // Check if streak exists
    if (!streak) {
      return next(new AppError('Streak entry not found', 404));
    }
    
    // Check if streak is from GitHub (can't update date for GitHub streaks)
    if (streak.source === 'github' && (req.body.date || req.body.commitCount)) {
      return next(
        new AppError('Cannot update date or commit count for GitHub streaks', 400)
      );
    }
    
    // Update streak
    await streak.update({
      ...(req.body.date && { date: new Date(req.body.date) }),
      ...(description !== undefined && { description }),
      ...(language && { language }),
      ...(commitCount !== undefined && { commitCount }),
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        streak,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a streak entry
 * @route DELETE /api/v1/streaks/:id
 */
const deleteStreak = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find streak
    const streak = await Streak.findOne({
      where: { id, userId },
    });
    
    // Check if streak exists
    if (!streak) {
      return next(new AppError('Streak entry not found', 404));
    }
    
    // Check if streak is from GitHub
    if (streak.source === 'github') {
      return next(
        new AppError('Cannot delete GitHub streaks', 400)
      );
    }
    
    // Delete streak
    await streak.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get streak statistics
 * @route GET /api/v1/streaks/stats
 */
const getStreakStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Calculate current streak
    const streakStats = await Streak.calculateCurrentStreak(userId);
    
    // Get language distribution
    const languageDistribution = await Streak.findAll({
      attributes: [
        'language',
        [Streak.sequelize.fn('COUNT', Streak.sequelize.col('id')), 'count'],
      ],
      where: {
        userId,
        language: {
          [Streak.sequelize.Op.ne]: null,
        },
      },
      group: ['language'],
      order: [[Streak.sequelize.literal('count'), 'DESC']],
    });
    
    // Format language distribution
    const formattedLanguageDistribution = languageDistribution.map((item) => ({
      language: item.language,
      count: parseInt(item.getDataValue('count'), 10),
    }));
    
    // Get monthly activity
    const monthlyActivity = await Streak.findAll({
      attributes: [
        [Streak.sequelize.fn('date_trunc', 'month', Streak.sequelize.col('date')), 'month'],
        [Streak.sequelize.fn('COUNT', Streak.sequelize.col('id')), 'count'],
      ],
      where: { userId },
      group: [Streak.sequelize.fn('date_trunc', 'month', Streak.sequelize.col('date'))],
      order: [[Streak.sequelize.literal('month'), 'ASC']],
    });
    
    // Format monthly activity
    const formattedMonthlyActivity = monthlyActivity.map((item) => ({
      month: item.getDataValue('month'),
      count: parseInt(item.getDataValue('count'), 10),
    }));
    
    res.status(200).json({
      status: 'success',
      data: {
        currentStreak: streakStats.currentStreak,
        longestStreak: streakStats.longestStreak,
        lastActiveDate: streakStats.lastActiveDate,
        languageDistribution: formattedLanguageDistribution,
        monthlyActivity: formattedMonthlyActivity,
        total: await Streak.count({ where: { userId } }),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Sync GitHub contributions to streaks
 * @route POST /api/v1/streaks/sync-github
 */
const syncGitHubContributions = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Check if user has GitHub username
    if (!user.githubUsername) {
      return next(
        new AppError('GitHub username not set in your profile', 400)
      );
    }
    
    // Get GitHub contribution data
    const contributionData = await githubService.getContributionData(
      user.githubUsername,
      user.githubToken
    );
    
    // Process contributions
    let createdCount = 0;
    let updatedCount = 0;
    
    for (const week of contributionData.weeks) {
      for (const day of week.contributionDays) {
        if (day.contributionCount > 0) {
          // Check if streak entry already exists for this date
          const existingStreak = await Streak.findOne({
            where: {
              userId: user.id,
              date: new Date(day.date),
            },
          });
          
          if (existingStreak) {
            // Update existing streak
            await existingStreak.update({
              commitCount: day.contributionCount,
              source: 'github',
            });
            updatedCount++;
          } else {
            // Create new streak
            await Streak.create({
              date: new Date(day.date),
              description: `GitHub: ${day.contributionCount} contribution(s)`,
              commitCount: day.contributionCount,
              source: 'github',
              userId: user.id,
            });
            createdCount++;
          }
        }
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: `GitHub contributions synced successfully. Created: ${createdCount}, Updated: ${updatedCount}`,
      data: {
        createdCount,
        updatedCount,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to sync GitHub contributions: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

module.exports = {
  getAllStreaks,
  getStreakById,
  createStreak,
  updateStreak,
  deleteStreak,
  getStreakStats,
  syncGitHubContributions,
};