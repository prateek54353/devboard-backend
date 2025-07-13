const stackoverflowService = require('../services/stackoverflow.service');
const { AppError } = require('../middleware/error.middleware');
const { isValidStackOverflowUserId } = require('../utils/validation');
const { User } = require('../models/user.model');

/**
 * Get StackOverflow profile by user ID
 * @route GET /api/v1/stackoverflow/profile/:userId
 */
const getProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate StackOverflow user ID
    if (!isValidStackOverflowUserId(userId)) {
      return next(new AppError('Invalid StackOverflow user ID format', 400));
    }

    // Get StackOverflow profile
    const profile = await stackoverflowService.getUserProfile(userId);

    if (!profile) {
      return next(new AppError('StackOverflow profile not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch StackOverflow profile: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get StackOverflow questions by user ID
 * @route GET /api/v1/stackoverflow/questions/:userId
 */
const getQuestionsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, pageSize } = req.query;

    // Validate StackOverflow user ID
    if (!isValidStackOverflowUserId(userId)) {
      return next(new AppError('Invalid StackOverflow user ID format', 400));
    }

    // Get StackOverflow questions
    const questions = await stackoverflowService.getUserQuestions(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10
    );

    res.status(200).json({
      status: 'success',
      results: questions.items.length,
      total: questions.total,
      hasMore: questions.has_more,
      data: {
        questions: questions.items,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch StackOverflow questions: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get StackOverflow answers by user ID
 * @route GET /api/v1/stackoverflow/answers/:userId
 */
const getAnswersByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { page, pageSize } = req.query;

    // Validate StackOverflow user ID
    if (!isValidStackOverflowUserId(userId)) {
      return next(new AppError('Invalid StackOverflow user ID format', 400));
    }

    // Get StackOverflow answers
    const answers = await stackoverflowService.getUserAnswers(
      userId,
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 10
    );

    res.status(200).json({
      status: 'success',
      results: answers.items.length,
      total: answers.total,
      hasMore: answers.has_more,
      data: {
        answers: answers.items,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch StackOverflow answers: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get StackOverflow top tags by user ID
 * @route GET /api/v1/stackoverflow/top-tags/:userId
 */
const getTopTagsByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate StackOverflow user ID
    if (!isValidStackOverflowUserId(userId)) {
      return next(new AppError('Invalid StackOverflow user ID format', 400));
    }

    // Get StackOverflow top tags
    const topTags = await stackoverflowService.getUserTopTags(userId);

    res.status(200).json({
      status: 'success',
      results: topTags.items.length,
      data: {
        topTags: topTags.items,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch StackOverflow top tags: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get comprehensive StackOverflow profile data by user ID
 * @route GET /api/v1/stackoverflow/comprehensive/:userId
 */
const getComprehensiveProfileByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Validate StackOverflow user ID
    if (!isValidStackOverflowUserId(userId)) {
      return next(new AppError('Invalid StackOverflow user ID format', 400));
    }

    // Get comprehensive StackOverflow profile data
    const profileData = await stackoverflowService.getComprehensiveProfile(userId);

    res.status(200).json({
      status: 'success',
      data: profileData,
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch comprehensive StackOverflow profile: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get StackOverflow data for the authenticated user
 * @route GET /api/v1/stackoverflow/me
 */
const getMyStackOverflowData = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user has StackOverflow user ID
    if (!user.stackoverflowUserId) {
      return next(
        new AppError('StackOverflow user ID not set in your profile', 400)
      );
    }

    // Get comprehensive StackOverflow profile data
    const profileData = await stackoverflowService.getComprehensiveProfile(
      user.stackoverflowUserId
    );

    res.status(200).json({
      status: 'success',
      data: profileData,
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch your StackOverflow data: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Link StackOverflow account to user profile
 * @route POST /api/v1/stackoverflow/link
 */
const linkStackOverflowAccount = async (req, res, next) => {
  try {
    const { stackoverflowUserId } = req.body;

    // Validate StackOverflow user ID
    if (!isValidStackOverflowUserId(stackoverflowUserId)) {
      return next(new AppError('Invalid StackOverflow user ID format', 400));
    }

    // Verify StackOverflow user ID exists by fetching profile
    try {
      const profile = await stackoverflowService.getUserProfile(stackoverflowUserId);
      if (!profile) {
        return next(new AppError('StackOverflow profile not found', 404));
      }
    } catch (error) {
      return next(
        new AppError(
          `Failed to verify StackOverflow account: ${error.message}`,
          error.response?.status || 400
        )
      );
    }

    // Update user with StackOverflow information
    await User.update(
      {
        stackoverflowUserId,
      },
      {
        where: { id: req.user.id },
      }
    );

    // Get updated user
    const updatedUser = await User.findByPk(req.user.id);
    updatedUser.password = undefined;

    res.status(200).json({
      status: 'success',
      message: 'StackOverflow account linked successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileByUserId,
  getQuestionsByUserId,
  getAnswersByUserId,
  getTopTagsByUserId,
  getComprehensiveProfileByUserId,
  getMyStackOverflowData,
  linkStackOverflowAccount,
};