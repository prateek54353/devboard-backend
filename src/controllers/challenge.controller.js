const { Challenge, UserChallenge } = require('../models/challenge.model');
const { AppError } = require('../middleware/error.middleware');
const challengeService = require('../services/challenge.service');

/**
 * Get all challenges
 * @route GET /api/v1/challenges
 */
const getAllChallenges = async (req, res, next) => {
  try {
    const { difficulty, language, tag, isPublic, sort, limit = 20, page = 1 } = req.query;
    
    // Build query conditions
    const where = {};
    
    // Filter by difficulty if provided
    if (difficulty) {
      where.difficulty = difficulty;
    }
    
    // Filter by language if provided
    if (language) {
      where.language = language;
    }
    
    // Filter by tag if provided
    if (tag) {
      where.tags = { [Challenge.sequelize.Op.contains]: [tag] };
    }
    
    // Filter by public/private
    if (isPublic !== undefined) {
      where.isPublic = isPublic === 'true';
    } else {
      // By default, show public challenges and user's own challenges
      where[Challenge.sequelize.Op.or] = [
        { isPublic: true },
        { createdBy: req.user.id },
      ];
    }
    
    // Build sort options
    let order = [['createdAt', 'DESC']]; // Default sort
    if (sort) {
      const [field, direction] = sort.split(':');
      if (['title', 'difficulty', 'language', 'createdAt'].includes(field)) {
        order = [[field, direction === 'desc' ? 'DESC' : 'ASC']];
      }
    }
    
    // Calculate pagination
    const offset = (page - 1) * limit;
    
    // Get challenges
    const challenges = await Challenge.findAndCountAll({
      where,
      order,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        {
          association: 'creator',
          attributes: ['id', 'username'],
        },
      ],
    });
    
    // Get user's progress on these challenges
    const challengeIds = challenges.rows.map(challenge => challenge.id);
    const userProgress = await UserChallenge.findAll({
      where: {
        userId: req.user.id,
        challengeId: { [Challenge.sequelize.Op.in]: challengeIds },
      },
    });
    
    // Map progress to challenges
    const progressMap = {};
    userProgress.forEach(progress => {
      progressMap[progress.challengeId] = progress;
    });
    
    // Add progress to challenge data
    const challengesWithProgress = challenges.rows.map(challenge => {
      const plainChallenge = challenge.get({ plain: true });
      return {
        ...plainChallenge,
        userProgress: progressMap[challenge.id] ? progressMap[challenge.id].get({ plain: true }) : null,
      };
    });
    
    res.status(200).json({
      status: 'success',
      results: challenges.rows.length,
      total: challenges.count,
      page: parseInt(page, 10),
      pages: Math.ceil(challenges.count / limit),
      data: {
        challenges: challengesWithProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single challenge by ID
 * @route GET /api/v1/challenges/:id
 */
const getChallengeById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find challenge
    const challenge = await Challenge.findByPk(id, {
      include: [
        {
          association: 'creator',
          attributes: ['id', 'username'],
        },
      ],
    });
    
    // Check if challenge exists
    if (!challenge) {
      return next(new AppError('Challenge not found', 404));
    }
    
    // Check if challenge is public or created by the user
    if (!challenge.isPublic && challenge.createdBy !== req.user.id) {
      return next(new AppError('You do not have permission to access this challenge', 403));
    }
    
    // Get user's progress on this challenge
    const userProgress = await UserChallenge.findOne({
      where: {
        userId: req.user.id,
        challengeId: challenge.id,
      },
    });
    
    // Add progress to challenge data
    const challengeWithProgress = {
      ...challenge.get({ plain: true }),
      userProgress: userProgress ? userProgress.get({ plain: true }) : null,
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        challenge: challengeWithProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new challenge
 * @route POST /api/v1/challenges
 */
const createChallenge = async (req, res, next) => {
  try {
    const { title, description, difficulty, language, tags, isPublic } = req.body;
    
    // Validate required fields
    if (!title || !description) {
      return next(new AppError('Title and description are required', 400));
    }
    
    // Create challenge
    const challenge = await Challenge.create({
      title,
      description,
      difficulty: difficulty || 'medium',
      language: language || 'javascript',
      tags: tags || [],
      isPublic: isPublic !== undefined ? isPublic : true,
      source: 'manual',
      createdBy: req.user.id,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        challenge,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a challenge
 * @route PATCH /api/v1/challenges/:id
 */
const updateChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, language, tags, isPublic } = req.body;
    
    // Find challenge
    const challenge = await Challenge.findByPk(id);
    
    // Check if challenge exists
    if (!challenge) {
      return next(new AppError('Challenge not found', 404));
    }
    
    // Check if user is the creator of the challenge
    if (challenge.createdBy !== req.user.id) {
      return next(new AppError('You do not have permission to update this challenge', 403));
    }
    
    // Update challenge
    await challenge.update({
      ...(title && { title }),
      ...(description && { description }),
      ...(difficulty && { difficulty }),
      ...(language && { language }),
      ...(tags && { tags }),
      ...(isPublic !== undefined && { isPublic }),
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        challenge,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a challenge
 * @route DELETE /api/v1/challenges/:id
 */
const deleteChallenge = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Find challenge
    const challenge = await Challenge.findByPk(id);
    
    // Check if challenge exists
    if (!challenge) {
      return next(new AppError('Challenge not found', 404));
    }
    
    // Check if user is the creator of the challenge
    if (challenge.createdBy !== req.user.id) {
      return next(new AppError('You do not have permission to delete this challenge', 403));
    }
    
    // Delete challenge
    await challenge.destroy();
    
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a new AI challenge
 * @route POST /api/v1/challenges/generate
 */
const generateChallenge = async (req, res, next) => {
  try {
    const { difficulty, language, topic } = req.body;
    
    // Generate challenge
    const generatedChallenge = await challengeService.generateChallenge({
      difficulty,
      language,
      topic,
    });
    
    // Create challenge in database
    const challenge = await Challenge.create({
      ...generatedChallenge,
      isPublic: true,
      createdBy: req.user.id,
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        challenge,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to generate challenge: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get or generate daily challenge
 * @route GET /api/v1/challenges/daily
 */
const getDailyChallenge = async (req, res, next) => {
  try {
    const { language } = req.query;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if daily challenge already exists for today
    const existingChallenge = await Challenge.findOne({
      where: {
        source: 'ai',
        isPublic: true,
        createdAt: {
          [Challenge.sequelize.Op.gte]: today,
        },
        expiresAt: {
          [Challenge.sequelize.Op.gte]: new Date(),
        },
        tags: { [Challenge.sequelize.Op.contains]: ['daily'] },
      },
    });
    
    if (existingChallenge) {
      // Get user's progress on this challenge
      const userProgress = await UserChallenge.findOne({
        where: {
          userId: req.user.id,
          challengeId: existingChallenge.id,
        },
      });
      
      // Add progress to challenge data
      const challengeWithProgress = {
        ...existingChallenge.get({ plain: true }),
        userProgress: userProgress ? userProgress.get({ plain: true }) : null,
      };
      
      return res.status(200).json({
        status: 'success',
        data: {
          challenge: challengeWithProgress,
        },
      });
    }
    
    // Generate new daily challenge
    const generatedChallenge = await challengeService.generateDailyChallenge(language);
    
    // Add daily tag
    generatedChallenge.tags = [...generatedChallenge.tags, 'daily'];
    
    // Create challenge in database
    const challenge = await Challenge.create({
      ...generatedChallenge,
      isPublic: true,
      createdBy: null, // System-generated
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        challenge: {
          ...challenge.get({ plain: true }),
          userProgress: null,
        },
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to get daily challenge: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get or generate weekly challenge
 * @route GET /api/v1/challenges/weekly
 */
const getWeeklyChallenge = async (req, res, next) => {
  try {
    const { language } = req.query;
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Check if weekly challenge already exists for this week
    const existingChallenge = await Challenge.findOne({
      where: {
        source: 'ai',
        isPublic: true,
        createdAt: {
          [Challenge.sequelize.Op.gte]: startOfWeek,
        },
        expiresAt: {
          [Challenge.sequelize.Op.gte]: new Date(),
        },
        tags: { [Challenge.sequelize.Op.contains]: ['weekly'] },
      },
    });
    
    if (existingChallenge) {
      // Get user's progress on this challenge
      const userProgress = await UserChallenge.findOne({
        where: {
          userId: req.user.id,
          challengeId: existingChallenge.id,
        },
      });
      
      // Add progress to challenge data
      const challengeWithProgress = {
        ...existingChallenge.get({ plain: true }),
        userProgress: userProgress ? userProgress.get({ plain: true }) : null,
      };
      
      return res.status(200).json({
        status: 'success',
        data: {
          challenge: challengeWithProgress,
        },
      });
    }
    
    // Generate new weekly challenge
    const generatedChallenge = await challengeService.generateWeeklyChallenge(language);
    
    // Add weekly tag
    generatedChallenge.tags = [...generatedChallenge.tags, 'weekly'];
    
    // Create challenge in database
    const challenge = await Challenge.create({
      ...generatedChallenge,
      isPublic: true,
      createdBy: null, // System-generated
    });
    
    res.status(201).json({
      status: 'success',
      data: {
        challenge: {
          ...challenge.get({ plain: true }),
          userProgress: null,
        },
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to get weekly challenge: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Update user's progress on a challenge
 * @route POST /api/v1/challenges/:id/progress
 */
const updateChallengeProgress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, solution } = req.body;
    
    // Find challenge
    const challenge = await Challenge.findByPk(id);
    
    // Check if challenge exists
    if (!challenge) {
      return next(new AppError('Challenge not found', 404));
    }
    
    // Check if challenge is public or created by the user
    if (!challenge.isPublic && challenge.createdBy !== req.user.id) {
      return next(new AppError('You do not have permission to access this challenge', 403));
    }
    
    // Find or create user progress
    const [userProgress, created] = await UserChallenge.findOrCreate({
      where: {
        userId: req.user.id,
        challengeId: challenge.id,
      },
      defaults: {
        status: status || 'not_started',
        solution: solution || null,
        completedAt: status === 'completed' ? new Date() : null,
      },
    });
    
    // Update progress if not created
    if (!created) {
      await userProgress.update({
        ...(status && { status }),
        ...(solution !== undefined && { solution }),
        ...(status === 'completed' && !userProgress.completedAt && { completedAt: new Date() }),
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        progress: userProgress,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllChallenges,
  getChallengeById,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  generateChallenge,
  getDailyChallenge,
  getWeeklyChallenge,
  updateChallengeProgress,
};