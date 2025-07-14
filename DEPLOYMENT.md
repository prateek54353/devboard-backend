# DevBoard API Deployment Guide

This guide provides instructions for deploying the DevBoard API in a production environment. The application can be deployed using Docker, PM2, or a traditional Node.js setup.

## Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- Docker and Docker Compose (for containerized deployment)
- Nginx (for reverse proxy setup)
- PM2 (for process management in traditional deployment)

## Environment Configuration

1. Copy the environment template to create your production environment file:

```bash
cp .env.production.template .env.production
```

2. Edit the `.env.production` file and fill in all the required values:
   - Database credentials
   - JWT secret
   - API keys for external services
   - CORS settings
   - Rate limiting configuration

## Deployment Options

### Option 1: Docker Deployment (Recommended)

The Docker deployment uses Docker Compose to orchestrate the application, database, and Nginx reverse proxy.

1. Make sure Docker and Docker Compose are installed on your server.

2. Build and start the containers:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. Verify the deployment:

```bash
docker-compose -f docker-compose.prod.yml ps
```

4. Check the logs:

```bash
docker-compose -f docker-compose.prod.yml logs -f api
```

#### SSL Configuration

For production deployment with HTTPS:

1. Place your SSL certificates in the `nginx/ssl` directory:
   - `server.crt`: Your SSL certificate
   - `server.key`: Your private key

2. Update the Nginx configuration in `nginx/conf.d/default.conf` if needed.

### Option 2: PM2 Deployment

PM2 is a process manager for Node.js applications that helps keep your application running in production.

1. Install PM2 globally:

```bash
npm install -g pm2
```

2. Start the application with PM2:

```bash
npm run pm2:start
```

3. Additional PM2 commands:
   - Stop the application: `npm run pm2:stop`
   - Restart the application: `npm run pm2:restart`
   - View logs: `npm run pm2:logs`
   - Monitor the application: `npm run pm2:monitor`

4. Configure PM2 to start on system boot:

```bash
pm2 startup
pm2 save
```

### Option 3: Traditional Node.js Deployment

1. Install dependencies:

```bash
npm ci --only=production
```

2. Start the application:

```bash
npm run start:prod
```

## Database Setup

The application will automatically initialize the database on startup. However, if you want to seed the database with initial data:

```bash
npm run seed
```

## Monitoring and Maintenance

### Health Check

The application provides a health check endpoint at `/health` that returns the status of the API.

### Metrics

The application provides a metrics endpoint at `/metrics` that returns system metrics like memory usage and uptime.

### Logs

Logs are stored in the `logs` directory. In Docker deployment, logs are stored in a Docker volume.

## Scaling

### Horizontal Scaling

For horizontal scaling, you can:

1. Deploy multiple instances of the API behind a load balancer
2. Use a shared database
3. Use a Redis cache for session storage (if implemented)

### Vertical Scaling

For vertical scaling, you can:

1. Increase the resources allocated to the Docker containers
2. Increase the resources on your server

## Backup and Recovery

### Database Backup

To backup the PostgreSQL database:

```bash
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres devboard > backup.sql
```

### Database Restore

To restore the PostgreSQL database:

```bash
cat backup.sql | docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres devboard
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**:
   - Check the database credentials in `.env.production`
   - Verify the database is running and accessible

2. **API Not Starting**:
   - Check the logs for errors
   - Verify all required environment variables are set

3. **Rate Limiting Issues**:
   - Adjust the rate limiting settings in the production configuration

## Security Considerations

1. **Environment Variables**: Never commit `.env.production` to version control
2. **JWT Secret**: Use a strong, unique secret for JWT token signing
3. **Database Credentials**: Use strong passwords for database access
4. **API Keys**: Protect your API keys for external services
5. **HTTPS**: Always use HTTPS in production
6. **Regular Updates**: Keep dependencies updated to patch security vulnerabilities

## CI/CD Integration

For continuous integration and deployment, you can use GitHub Actions, GitLab CI, Jenkins, or other CI/CD tools. A sample workflow might include:

1. Run tests
2. Build Docker image
3. Push to container registry
4. Deploy to staging/production

## Support

For issues or questions, please open an issue on the GitHub repository or contact the DevBoard team.