const axios = require('axios');
require('dotenv').config();

/**
 * Challenge service for generating coding challenges using HuggingFace API
 */
class ChallengeService {
  constructor() {
    this.apiToken = process.env.HUGGINGFACE_API_TOKEN;
    this.apiUrl = process.env.HUGGINGFACE_API_URL || 'https://api-inference.huggingface.co/models/';
    this.defaultModel = 'gpt2'; // Fallback model if not specified
  }

  /**
   * Generate a coding challenge using HuggingFace API
   * @param {Object} options - Challenge generation options
   * @param {String} options.difficulty - Challenge difficulty (easy, medium, hard)
   * @param {String} options.language - Programming language
   * @param {String} options.topic - Challenge topic
   * @param {String} options.model - HuggingFace model to use (optional)
   * @returns {Promise<Object>} Generated challenge
   */
  async generateChallenge(options = {}) {
    const { difficulty = 'medium', language = 'javascript', topic, model } = options;
    
    // Use specified model or default
    const modelToUse = model || this.defaultModel;
    
    try {
      // Create prompt for the model
      const prompt = this.createChallengePrompt(difficulty, language, topic);
      
      // Call HuggingFace API
      const response = await axios.post(
        `${this.apiUrl}${modelToUse}`,
        {
          inputs: prompt,
          parameters: {
            max_length: 500,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Process the response
      const generatedText = response.data[0]?.generated_text || response.data?.generated_text;
      
      if (!generatedText) {
        throw new Error('Failed to generate challenge text');
      }
      
      // Parse the generated text into a structured challenge
      return this.parseGeneratedChallenge(generatedText, difficulty, language, topic);
    } catch (error) {
      // If HuggingFace API fails, fall back to predefined challenges
      console.error('Failed to generate challenge from HuggingFace:', error);
      return this.getFallbackChallenge(difficulty, language, topic);
    }
  }

  /**
   * Create a prompt for the HuggingFace model
   * @param {String} difficulty - Challenge difficulty
   * @param {String} language - Programming language
   * @param {String} topic - Challenge topic
   * @returns {String} Prompt for the model
   */
  createChallengePrompt(difficulty, language, topic) {
    return `Create a ${difficulty} level coding challenge for ${language}${
      topic ? ` about ${topic}` : ''
    }. Include a title, description, example input/output, and constraints.

Title:
`;
  }

  /**
   * Parse generated text into a structured challenge
   * @param {String} text - Generated text from HuggingFace
   * @param {String} difficulty - Challenge difficulty
   * @param {String} language - Programming language
   * @param {String} topic - Challenge topic
   * @returns {Object} Structured challenge
   */
  parseGeneratedChallenge(text, difficulty, language, topic) {
    // Extract title (first line after "Title:")
    const titleMatch = text.match(/Title:\s*([^\n]+)/);
    const title = titleMatch ? titleMatch[1].trim() : `${difficulty} ${language} challenge`;
    
    // Extract description (everything between title and examples)
    let description = text;
    if (titleMatch) {
      description = description.substring(description.indexOf(titleMatch[0]) + titleMatch[0].length).trim();
    }
    
    // Clean up description
    description = description.replace(/Example(s)?:[\s\S]*$/, '').trim();
    if (!description) {
      description = `Solve this ${difficulty} ${language} coding challenge${topic ? ` about ${topic}` : ''}.`;
    }
    
    // Extract examples
    const examplesMatch = text.match(/Example(s)?:[\s\S]*/);
    const examples = examplesMatch ? examplesMatch[0].trim() : '';
    
    return {
      title,
      description: `${description}\n\n${examples}`,
      difficulty,
      language,
      tags: [language, difficulty, ...(topic ? [topic] : [])],
      source: 'ai',
    };
  }

  /**
   * Get a fallback challenge when HuggingFace API fails
   * @param {String} difficulty - Challenge difficulty
   * @param {String} language - Programming language
   * @param {String} topic - Challenge topic
   * @returns {Object} Fallback challenge
   */
  getFallbackChallenge(difficulty, language, topic) {
    // Predefined challenges by difficulty
    const challenges = {
      easy: [
        {
          title: 'Sum of Two Numbers',
          description: 'Write a function that takes two numbers as input and returns their sum.\n\nExample:\nInput: 5, 3\nOutput: 8',
          language,
          tags: [language, 'easy', 'math'],
        },
        {
          title: 'Reverse a String',
          description: 'Write a function that reverses a string.\n\nExample:\nInput: "hello"\nOutput: "olleh"',
          language,
          tags: [language, 'easy', 'strings'],
        },
      ],
      medium: [
        {
          title: 'Find the Missing Number',
          description: 'Given an array containing n distinct numbers taken from 0, 1, 2, ..., n, find the one that is missing.\n\nExample:\nInput: [3, 0, 1]\nOutput: 2',
          language,
          tags: [language, 'medium', 'arrays'],
        },
        {
          title: 'Valid Parentheses',
          description: 'Given a string containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid. An input string is valid if open brackets are closed by the same type of brackets, and open brackets are closed in the correct order.\n\nExample:\nInput: "()[]{}"\nOutput: true',
          language,
          tags: [language, 'medium', 'stacks'],
        },
      ],
      hard: [
        {
          title: 'Longest Substring Without Repeating Characters',
          description: 'Given a string, find the length of the longest substring without repeating characters.\n\nExample:\nInput: "abcabcbb"\nOutput: 3\nExplanation: The answer is "abc", with the length of 3.',
          language,
          tags: [language, 'hard', 'strings'],
        },
        {
          title: 'Merge k Sorted Lists',
          description: 'Merge k sorted linked lists and return it as one sorted list.\n\nExample:\nInput: [\n  1->4->5,\n  1->3->4,\n  2->6\n]\nOutput: 1->1->2->3->4->4->5->6',
          language,
          tags: [language, 'hard', 'linked lists'],
        },
      ],
    };
    
    // Select a random challenge from the appropriate difficulty level
    const difficultyLevel = challenges[difficulty] || challenges.medium;
    const randomIndex = Math.floor(Math.random() * difficultyLevel.length);
    const challenge = difficultyLevel[randomIndex];
    
    return {
      ...challenge,
      difficulty,
      source: 'ai',
    };
  }

  /**
   * Generate a daily challenge
   * @param {String} language - Programming language (optional)
   * @returns {Promise<Object>} Generated daily challenge
   */
  async generateDailyChallenge(language = null) {
    // Randomly select difficulty with weighted distribution
    const difficulties = ['easy', 'medium', 'hard'];
    const weights = [0.4, 0.4, 0.2]; // 40% easy, 40% medium, 20% hard
    
    const randomValue = Math.random();
    let cumulativeWeight = 0;
    let selectedDifficulty = difficulties[0];
    
    for (let i = 0; i < difficulties.length; i++) {
      cumulativeWeight += weights[i];
      if (randomValue <= cumulativeWeight) {
        selectedDifficulty = difficulties[i];
        break;
      }
    }
    
    // Generate challenge
    const challenge = await this.generateChallenge({
      difficulty: selectedDifficulty,
      language: language || 'javascript',
    });
    
    // Set expiration date to end of day
    const expiresAt = new Date();
    expiresAt.setHours(23, 59, 59, 999);
    
    return {
      ...challenge,
      expiresAt,
    };
  }

  /**
   * Generate a weekly challenge
   * @param {String} language - Programming language (optional)
   * @returns {Promise<Object>} Generated weekly challenge
   */
  async generateWeeklyChallenge(language = null) {
    // Weekly challenges are typically medium or hard
    const difficulties = ['medium', 'hard'];
    const selectedDifficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    
    // Generate challenge
    const challenge = await this.generateChallenge({
      difficulty: selectedDifficulty,
      language: language || 'javascript',
    });
    
    // Set expiration date to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    expiresAt.setHours(23, 59, 59, 999);
    
    return {
      ...challenge,
      expiresAt,
    };
  }
}

module.exports = new ChallengeService();