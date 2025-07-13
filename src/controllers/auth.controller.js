const { User } = require('../models/user.model');
const { AppError } = require('../middleware/error.middleware');
const { generateToken } = require('../utils/jwt');
const { isValidEmail, validatePassword } = require('../utils/validation');

/**
 * Register a new user
 * @route POST /api/v1/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return next(new AppError('Please provide username, email and password', 400));
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return next(new AppError(passwordValidation.message, 400));
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Op.or]: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return next(new AppError('User with that email or username already exists', 400));
    }

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password,
    });

    // Generate JWT token
    const token = generateToken(newUser);

    // Remove password from response
    newUser.password = undefined;

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: newUser,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 * @route POST /api/v1/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    // Update last login timestamp
    await user.updateLastLogin();

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 * @route GET /api/v1/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    // User is already available in req.user from auth middleware
    const user = req.user;

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 * @route PATCH /api/v1/auth/update-profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { username, email, githubUsername, stackoverflowUserId } = req.body;

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return next(new AppError('Please provide a valid email address', 400));
    }

    // Check if email is already taken
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return next(new AppError('Email is already taken', 400));
      }
    }

    // Check if username is already taken
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return next(new AppError('Username is already taken', 400));
      }
    }

    // Update user
    const updatedUser = await User.update(
      {
        ...(username && { username }),
        ...(email && { email }),
        ...(githubUsername && { githubUsername }),
        ...(stackoverflowUserId && { stackoverflowUserId }),
      },
      {
        where: { id: req.user.id },
        returning: true,
      }
    );

    // Get updated user
    const user = await User.findByPk(req.user.id);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update password
 * @route PATCH /api/v1/auth/update-password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return next(
        new AppError('Please provide current password and new password', 400)
      );
    }

    // Get user with password
    const user = await User.findByPk(req.user.id);

    // Check if current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    // Validate new password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return next(new AppError(passwordValidation.message, 400));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new JWT token
    const token = generateToken(user);

    // Remove password from response
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
};