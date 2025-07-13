const githubService = require('../services/github.service');
const { AppError } = require('../middleware/error.middleware');
const { isValidGithubUsername } = require('../utils/validation');
const { User } = require('../models/user.model');

/**
 * Get GitHub profile by username
 * @route GET /api/v1/github/profile/:username
 */
const getProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate GitHub username
    if (!isValidGithubUsername(username)) {
      return next(new AppError('Invalid GitHub username format', 400));
    }

    // Get GitHub profile
    const profile = await githubService.getUserProfile(username);

    res.status(200).json({
      status: 'success',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch GitHub profile: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get GitHub repositories by username
 * @route GET /api/v1/github/repos/:username
 */
const getRepositoriesByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { limit } = req.query;

    // Validate GitHub username
    if (!isValidGithubUsername(username)) {
      return next(new AppError('Invalid GitHub username format', 400));
    }

    // Get GitHub repositories
    const repositories = await githubService.getUserRepositories(
      username,
      null,
      limit ? parseInt(limit, 10) : 10
    );

    res.status(200).json({
      status: 'success',
      results: repositories.length,
      data: {
        repositories,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch GitHub repositories: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get GitHub pinned repositories by username
 * @route GET /api/v1/github/pinned/:username
 */
const getPinnedRepositoriesByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate GitHub username
    if (!isValidGithubUsername(username)) {
      return next(new AppError('Invalid GitHub username format', 400));
    }

    // Get GitHub pinned repositories
    const pinnedRepositories = await githubService.getPinnedRepositories(username);

    res.status(200).json({
      status: 'success',
      results: pinnedRepositories.length,
      data: {
        pinnedRepositories,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch GitHub pinned repositories: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get GitHub contribution data by username
 * @route GET /api/v1/github/contributions/:username
 */
const getContributionsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate GitHub username
    if (!isValidGithubUsername(username)) {
      return next(new AppError('Invalid GitHub username format', 400));
    }

    // Get GitHub contribution data
    const contributions = await githubService.getContributionData(username);

    res.status(200).json({
      status: 'success',
      data: {
        contributions,
      },
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch GitHub contributions: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get comprehensive GitHub profile data by username
 * @route GET /api/v1/github/comprehensive/:username
 */
const getComprehensiveProfileByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Validate GitHub username
    if (!isValidGithubUsername(username)) {
      return next(new AppError('Invalid GitHub username format', 400));
    }

    // Get comprehensive GitHub profile data
    const profileData = await githubService.getComprehensiveProfile(username);

    res.status(200).json({
      status: 'success',
      data: profileData,
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch comprehensive GitHub profile: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Get GitHub data for the authenticated user
 * @route GET /api/v1/github/me
 */
const getMyGitHubData = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user has GitHub username
    if (!user.githubUsername) {
      return next(
        new AppError('GitHub username not set in your profile', 400)
      );
    }

    // Get comprehensive GitHub profile data
    const profileData = await githubService.getComprehensiveProfile(
      user.githubUsername,
      user.githubToken
    );

    res.status(200).json({
      status: 'success',
      data: profileData,
    });
  } catch (error) {
    next(
      new AppError(
        `Failed to fetch your GitHub data: ${error.message}`,
        error.response?.status || 500
      )
    );
  }
};

/**
 * Link GitHub account to user profile
 * @route POST /api/v1/github/link
 */
const linkGitHubAccount = async (req, res, next) => {
  try {
    const { githubUsername, githubToken } = req.body;

    // Validate GitHub username
    if (!isValidGithubUsername(githubUsername)) {
      return next(new AppError('Invalid GitHub username format', 400));
    }

    // Verify GitHub username exists by fetching profile
    try {
      await githubService.getUserProfile(githubUsername, githubToken);
    } catch (error) {
      return next(
        new AppError(
          `Failed to verify GitHub account: ${error.message}`,
          error.response?.status || 400
        )
      );
    }

    // Update user with GitHub information
    await User.update(
      {
        githubUsername,
        ...(githubToken && { githubToken }),
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
      message: 'GitHub account linked successfully',
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfileByUsername,
  getRepositoriesByUsername,
  getPinnedRepositoriesByUsername,
  getContributionsByUsername,
  getComprehensiveProfileByUsername,
  getMyGitHubData,
  linkGitHubAccount,
};