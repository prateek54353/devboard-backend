# Build stage
FROM node:18-alpine AS build

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Run linting and tests if needed
# RUN npm run lint && npm test

# Production stage
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /usr/src/app/src ./src
COPY --from=build --chown=nodejs:nodejs /usr/src/app/start-production.js ./
COPY --from=build --chown=nodejs:nodejs /usr/src/app/server.js ./

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose the port the app runs on
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Add metadata labels
LABEL maintainer="DevBoard Team" \
      version="1.0.0" \
      description="DevBoard API - Developer Productivity Tool Backend"

# Command to run the application
CMD ["npm", "run", "start:prod"]