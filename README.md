# DevBoard API Backend

A modular backend for an open-source developer productivity tool that serves both a Kotlin Android app and a Web frontend.

## Overview

DevBoard is a developer productivity tool that integrates with GitHub and StackOverflow, provides todo management, tracks coding streaks, and generates coding challenges. This backend provides RESTful API endpoints for all these features.

## Features

### 🔐 Authentication
- JWT-based authentication
- User signup and login
- Secure endpoints for personal data

### 🧱 Modules

#### 1. GitHub Integration
- Fetch GitHub profile, pinned repos, contribution graph
- Accept GitHub username or token
- Cache results to avoid hitting rate limits

#### 2. StackOverflow Integration
- Fetch profile info (reputation, questions, answers)
- Accept StackOverflow user ID

#### 3. Todo Manager
- CRUD endpoints for personal todos
- Each todo: title, tags, status (done/pending), deadline
- Store user-specific data

#### 4. Coding Streak Tracker
- Track daily activity (commits or custom entries)
- Record date, description, language
- Return streak statistics

#### 5. AI Challenge Generator
- Use a HuggingFace model API endpoint
- Generate coding challenges (title, difficulty, description)
- Support daily/weekly challenge mode

## Tech Stack

- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **External APIs**: GitHub, StackOverflow, HuggingFace

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/devboard-backend.git
   cd devboard-backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration.

5. Start the development server:
   ```
   npm run dev
   ```

### Database Setup

1. Create a PostgreSQL database:
   ```
   createdb devboard
   ```

2. The application will automatically create the tables when it starts.

## API Documentation

API documentation is available at `/api-docs` when the server is running.

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Login user |
| GET | `/api/v1/auth/me` | Get current user profile |
| PATCH | `/api/v1/auth/update-profile` | Update user profile |
| PATCH | `/api/v1/auth/update-password` | Update password |

### GitHub Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/github/profile/:username` | Get GitHub profile by username |
| GET | `/api/v1/github/repos/:username` | Get GitHub repositories by username |
| GET | `/api/v1/github/pinned/:username` | Get GitHub pinned repositories by username |
| GET | `/api/v1/github/contributions/:username` | Get GitHub contribution data by username |
| GET | `/api/v1/github/comprehensive/:username` | Get comprehensive GitHub profile data by username |
| GET | `/api/v1/github/me` | Get GitHub data for the authenticated user |
| POST | `/api/v1/github/link` | Link GitHub account to user profile |

### StackOverflow Integration Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/stackoverflow/profile/:userId` | Get StackOverflow profile by user ID |
| GET | `/api/v1/stackoverflow/questions/:userId` | Get StackOverflow questions by user ID |
| GET | `/api/v1/stackoverflow/answers/:userId` | Get StackOverflow answers by user ID |
| GET | `/api/v1/stackoverflow/top-tags/:userId` | Get StackOverflow top tags by user ID |
| GET | `/api/v1/stackoverflow/comprehensive/:userId` | Get comprehensive StackOverflow profile data by user ID |
| GET | `/api/v1/stackoverflow/me` | Get StackOverflow data for the authenticated user |
| POST | `/api/v1/stackoverflow/link` | Link StackOverflow account to user profile |

### Todo Manager Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/todos` | Get all todos for the authenticated user |
| GET | `/api/v1/todos/stats` | Get todo statistics |
| GET | `/api/v1/todos/:id` | Get a single todo by ID |
| POST | `/api/v1/todos` | Create a new todo |
| PATCH | `/api/v1/todos/:id` | Update a todo |
| DELETE | `/api/v1/todos/:id` | Delete a todo |

### Coding Streak Tracker Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/streaks` | Get all streak entries for the authenticated user |
| GET | `/api/v1/streaks/stats` | Get streak statistics |
| POST | `/api/v1/streaks/sync-github` | Sync GitHub contributions to streaks |
| GET | `/api/v1/streaks/:id` | Get a single streak entry by ID |
| POST | `/api/v1/streaks` | Create a new streak entry |
| PATCH | `/api/v1/streaks/:id` | Update a streak entry |
| DELETE | `/api/v1/streaks/:id` | Delete a streak entry |

### AI Challenge Generator Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/challenges` | Get all challenges |
| GET | `/api/v1/challenges/daily` | Get or generate daily challenge |
| GET | `/api/v1/challenges/weekly` | Get or generate weekly challenge |
| POST | `/api/v1/challenges/generate` | Generate a new AI challenge |
| GET | `/api/v1/challenges/:id` | Get a single challenge by ID |
| POST | `/api/v1/challenges` | Create a new challenge |
| PATCH | `/api/v1/challenges/:id` | Update a challenge |
| DELETE | `/api/v1/challenges/:id` | Delete a challenge |
| POST | `/api/v1/challenges/:id/progress` | Update user's progress on a challenge |

## Development

### Scripts

- `npm run dev`: Start the development server with hot reloading
- `npm start`: Start the production server
- `npm test`: Run tests
- `npm run lint`: Run linting

### Project Structure

```
devboard-backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.js          # Express app setup
├── .env.example        # Example environment variables
├── .gitignore          # Git ignore file
├── server.js           # Server entry point
└── README.md           # Project documentation
```

## Deployment

### Docker

A Dockerfile is provided for containerization. To build and run the Docker container:

```
docker build -t devboard-backend .
docker run -p 3000:3000 devboard-backend
```

### Environment Variables

See `.env.example` for required environment variables.

## License

This project is licensed under the MIT License.