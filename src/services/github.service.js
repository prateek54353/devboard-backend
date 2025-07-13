const axios = require('axios');
require('dotenv').config();

// Cache for GitHub API responses
const cache = {
  data: {},
  timestamps: {},
};

// Cache duration in seconds (from .env or default to 1 hour)
const CACHE_DURATION = parseInt(process.env.CACHE_DURATION, 10) || 3600;

/**
 * GitHub API service
 */
class GitHubService {
  constructor() {
    this.baseUrl = process.env.GITHUB_API_URL || 'https://api.github.com';
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
  }

  /**
   * Get GitHub API headers
   * @param {String} token - GitHub personal access token (optional)
   * @returns {Object} Headers for GitHub API requests
   */
  getHeaders(token) {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (token) {
      headers['Authorization'] = `token ${token}`;
    } else if (this.clientId && this.clientSecret) {
      // Use client ID and secret for unauthenticated requests
      // This increases rate limits but doesn't provide user-specific access
      headers['Authorization'] = `Basic ${Buffer.from(
        `${this.clientId}:${this.clientSecret}`
      ).toString('base64')}`;
    }

    return headers;
  }

  /**
   * Make a cached API request to GitHub
   * @param {String} endpoint - API endpoint
   * @param {String} token - GitHub personal access token (optional)
   * @returns {Promise<Object>} API response
   */
  async cachedRequest(endpoint, token = null) {
    const cacheKey = `${endpoint}_${token || 'anonymous'}`;
    const now = Date.now();

    // Check if we have a cached response that's still valid
    if (
      cache.data[cacheKey] &&
      now - cache.timestamps[cacheKey] < CACHE_DURATION * 1000
    ) {
      return cache.data[cacheKey];
    }

    // Make the API request
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: this.getHeaders(token),
      });

      // Cache the response
      cache.data[cacheKey] = response.data;
      cache.timestamps[cacheKey] = now;

      return response.data;
    } catch (error) {
      // Handle rate limiting
      if (error.response && error.response.status === 403) {
        const rateLimitRemaining = error.response.headers['x-ratelimit-remaining'];
        const rateLimitReset = error.response.headers['x-ratelimit-reset'];

        if (rateLimitRemaining === '0') {
          const resetTime = new Date(rateLimitReset * 1000);
          throw new Error(
            `GitHub API rate limit exceeded. Resets at ${resetTime.toISOString()}`
          );
        }
      }

      throw error;
    }
  }

  /**
   * Get user profile information
   * @param {String} username - GitHub username
   * @param {String} token - GitHub personal access token (optional)
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(username, token = null) {
    return await this.cachedRequest(`/users/${username}`, token);
  }

  /**
   * Get user repositories
   * @param {String} username - GitHub username
   * @param {String} token - GitHub personal access token (optional)
   * @param {Number} limit - Maximum number of repositories to return
   * @returns {Promise<Array>} User repositories
   */
  async getUserRepositories(username, token = null, limit = 10) {
    const repos = await this.cachedRequest(
      `/users/${username}/repos?sort=updated&per_page=${limit}`,
      token
    );
    return repos;
  }

  /**
   * Get user's pinned repositories
   * @param {String} username - GitHub username
   * @param {String} token - GitHub personal access token (optional)
   * @returns {Promise<Array>} Pinned repositories
   */
  async getPinnedRepositories(username, token = null) {
    // GitHub API doesn't directly expose pinned repos
    // We use the GraphQL API to get this information
    // This is a simplified version that gets the first 6 pinned repos
    try {
      const response = await axios.post(
        'https://api.github.com/graphql',
        {
          query: `
            {
              user(login: "${username}") {
                pinnedItems(first: 6, types: REPOSITORY) {
                  nodes {
                    ... on Repository {
                      name
                      description
                      url
                      stargazerCount
                      forkCount
                      primaryLanguage {
                        name
                        color
                      }
                    }
                  }
                }
              }
            }
          `,
        },
        {
          headers: {
            ...this.getHeaders(token),
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.user.pinnedItems.nodes;
    } catch (error) {
      // If GraphQL fails, fall back to regular repos
      console.error('Failed to fetch pinned repos, falling back to regular repos:', error);
      return await this.getUserRepositories(username, token, 6);
    }
  }

  /**
   * Get user's contribution data
   * @param {String} username - GitHub username
   * @param {String} token - GitHub personal access token (optional)
   * @returns {Promise<Object>} Contribution data
   */
  async getContributionData(username, token = null) {
    // GitHub API doesn't directly expose contribution graph data
    // We use the GraphQL API to get this information
    try {
      const response = await axios.post(
        'https://api.github.com/graphql',
        {
          query: `
            {
              user(login: "${username}") {
                contributionsCollection {
                  contributionCalendar {
                    totalContributions
                    weeks {
                      contributionDays {
                        date
                        contributionCount
                        color
                      }
                    }
                  }
                }
              }
            }
          `,
        },
        {
          headers: {
            ...this.getHeaders(token),
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.errors) {
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.user.contributionsCollection.contributionCalendar;
    } catch (error) {
      throw new Error(`Failed to fetch contribution data: ${error.message}`);
    }
  }

  /**
   * Get comprehensive GitHub profile data
   * @param {String} username - GitHub username
   * @param {String} token - GitHub personal access token (optional)
   * @returns {Promise<Object>} Comprehensive profile data
   */
  async getComprehensiveProfile(username, token = null) {
    try {
      // Fetch data in parallel
      const [profile, repos, pinnedRepos, contributions] = await Promise.all([
        this.getUserProfile(username, token),
        this.getUserRepositories(username, token),
        this.getPinnedRepositories(username, token),
        this.getContributionData(username, token),
      ]);

      return {
        profile,
        repositories: repos,
        pinnedRepositories: pinnedRepos,
        contributions,
      };
    } catch (error) {
      throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
    }
  }
}

module.exports = new GitHubService();