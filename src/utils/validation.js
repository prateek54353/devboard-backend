/**
 * Validation utility functions
 */

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long',
    };
  }

  // Check for at least one uppercase letter, one lowercase letter, and one number
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber) {
    return {
      isValid: false,
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    };
  }

  return {
    isValid: true,
    message: 'Password is valid',
  };
};

/**
 * Validate GitHub username format
 * @param {String} username - GitHub username to validate
 * @returns {Boolean} True if valid, false otherwise
 */
const isValidGithubUsername = (username) => {
  // GitHub username can only contain alphanumeric characters or hyphens
  // Cannot have multiple consecutive hyphens
  // Cannot begin or end with a hyphen
  // Maximum is 39 characters
  const githubUsernameRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  return githubUsernameRegex.test(username);
};

/**
 * Validate StackOverflow user ID
 * @param {String} userId - StackOverflow user ID to validate
 * @returns {Boolean} True if valid, false otherwise
 */
const isValidStackOverflowUserId = (userId) => {
  // StackOverflow user IDs are numeric
  return /^\d+$/.test(userId);
};

module.exports = {
  isValidEmail,
  validatePassword,
  isValidGithubUsername,
  isValidStackOverflowUserId,
};