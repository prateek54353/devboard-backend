const axios = require('axios');
require('dotenv').config();

// Cache for StackOverflow API responses
const cache = {
  data: {},
  timestamps: {},
};

// Cache duration in seconds (from .env or default to 1 hour)
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION, 10) || 3600;

/**
 * StackOverflow API service
 */
class StackOverflowService {
  constructor() {
    this.baseUrl = process.env.STACKOVERFLOW_API_URL || 'https://api.stackexchange.com/2.3';
  }

  /**
   * Make a cached API request to StackOverflow
   * @param {String} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} API response
   */
  async cachedRequest(endpoint, params = {}) {
    // Create a cache key from the endpoint and params
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    const now = Date.now();

    // Check if we have a cached response that's still valid
    if (
      cache.data[cacheKey] &&
      now - cache.timestamps[cacheKey] < CACHE_DURATION * 1000
    ) {
      return cache.data[cacheKey];
    }

    // Default parameters for all requests
    const defaultParams = {
      site: 'stackoverflow',
      key: process.env.STACKOVERFLOW_API_KEY, // Optional, increases quota
    };

    // Merge default params with provided params
    const mergedParams = { ...defaultParams, ...params };

    // Make the API request
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: mergedParams,
      });

      // Cache the response
      cache.data[cacheKey] = response.data;
      cache.timestamps[cacheKey] = now;

      return response.data;
    } catch (error) {
      // Handle quota violations
      if (error.response && error.response.data && error.response.data.error_id === 502) {
        throw new Error('StackOverflow API quota exceeded');
      }

      throw error;
    }
  }

  /**
   * Get user profile information
   * @param {String} userId - StackOverflow user ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId) {
    const response = await this.cachedRequest(`/users/${userId}`, {
      filter: 'withbadges', // Include badge information
    });

    return response.items[0] || null;
  }

  /**
   * Get user's questions
   * @param {String} userId - StackOverflow user ID
   * @param {Number} page - Page number
   * @param {Number} pageSize - Page size
   * @returns {Promise<Object>} User questions
   */
  async getUserQuestions(userId, page = 1, pageSize = 10) {
    return await this.cachedRequest(`/users/${userId}/questions`, {
      page,
      pagesize: pageSize,
      order: 'desc',
      sort: 'activity',
      filter: '!-*f(6s6U8Q9b', // Custom filter to include vote counts, view counts, etc.
    });
  }

  /**
   * Get user's answers
   * @param {String} userId - StackOverflow user ID
   * @param {Number} page - Page number
   * @param {Number} pageSize - Page size
   * @returns {Promise<Object>} User answers
   */
  async getUserAnswers(userId, page = 1, pageSize = 10) {
    return await this.cachedRequest(`/users/${userId}/answers`, {
      page,
      pagesize: pageSize,
      order: 'desc',
      sort: 'activity',
      filter: '!-*f(6sFKmVSCD', // Custom filter to include vote counts, is_accepted, etc.
    });
  }

  /**
   * Get user's top tags
   * @param {String} userId - StackOverflow user ID
   * @returns {Promise<Object>} User top tags
   */
  async getUserTopTags(userId) {
    return await this.cachedRequest(`/users/${userId}/top-tags`, {
      filter: '!-.7zntT7S7', // Custom filter to include tag scores
    });
  }

  /**
   * Get user's reputation history
   * @param {String} userId - StackOverflow user ID
   * @returns {Promise<Object>} User reputation history
   */
  async getUserReputationHistory(userId) {
    return await this.cachedRequest(`/users/${userId}/reputation-history`, {
      filter: '!-.7zntT7S7', // Custom filter to include detailed reputation events
    });
  }

  /**
   * Get comprehensive StackOverflow profile data
   * @param {String} userId - StackOverflow user ID
   * @returns {Promise<Object>} Comprehensive profile data
   */
  async getComprehensiveProfile(userId) {
    try {
      // Fetch data in parallel
      const [profile, questions, answers, topTags, reputationHistory] = await Promise.all([
        this.getUserProfile(userId),
        this.getUserQuestions(userId),
        this.getUserAnswers(userId),
        this.getUserTopTags(userId),
        this.getUserReputationHistory(userId),
      ]);

      return {
        profile,
        questions: questions.items,
        answers: answers.items,
        topTags: topTags.items,
        reputationHistory: reputationHistory.items,
      };
    } catch (error) {
      throw new Error(`Failed to fetch StackOverflow profile: ${error.message}`);
    }
  }
}

module.exports = new StackOverflowService();