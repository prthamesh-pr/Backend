# Backend Directory Structure

This document provides a detailed overview of the backend directory structure and organization.

## Root Directory

```
backend/
├── .dockerignore           # Docker ignore file
├── .env                    # Environment variables (production)
├── .env.development        # Development environment variables
├── .env.example           # Environment variables template
├── .env.production        # Production environment variables
├── .env.render            # Render.com specific variables
├── .git/                  # Git repository data
├── .gitignore             # Git ignore rules
├── docker-compose.yml     # Docker compose configuration
├── Dockerfile             # Docker image configuration
├── ecosystem.config.json  # PM2 process manager configuration
├── node_modules/          # NPM dependencies (auto-generated)
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── README.md              # Project documentation
├── server.js              # Main application entry point
└── [directories below]
```

## Directory Structure

### `/docs`
Documentation and guides
```
docs/
└── MONGODB_TROUBLESHOOTING.md  # MongoDB setup and troubleshooting guide
```

### `/middleware`
Express.js middleware functions
```
middleware/
└── auth.js                     # JWT authentication middleware
```

### `/models`
MongoDB/Mongoose data models
```
models/
├── User.js                     # User schema and model
└── Vehicle.js                  # Vehicle schema and model
```

### `/nginx`
Nginx web server configuration
```
nginx/
└── nginx.conf                  # Nginx configuration for reverse proxy
```

### `/routes`
Express.js route handlers
```
routes/
├── auth.js                     # Authentication endpoints
├── export.js                   # Data export endpoints (PDF/Excel)
└── vehicles.js                 # Vehicle CRUD endpoints
```

### `/scripts`
Utility and setup scripts
```
scripts/
├── add-demo-user.js            # Add demo user for testing
├── create-demo-users.js        # Bulk create demo users
├── deploy.bat                  # Windows deployment script
├── deploy.sh                   # Linux/Mac deployment script
├── setup-demo-users.js         # Setup multiple demo users
├── setup.js                    # Initial application setup
└── validate-db.js              # Database connection validation
```

### `/uploads`
File upload storage
```
uploads/
└── vehicles/                   # Vehicle image uploads
    └── .gitkeep               # Keep directory in git
```

## File Organization Principles

1. **Separation of Concerns**: Each directory has a specific purpose
2. **Environment Management**: Multiple .env files for different environments
3. **Documentation**: Clear documentation in `/docs` directory
4. **Utilities**: Helper scripts organized in `/scripts`
5. **Security**: Proper .gitignore to exclude sensitive files
6. **Deployment**: Ready-to-deploy with Docker and PM2 configurations

## Key Files

- **server.js**: Main application entry point
- **package.json**: Dependencies, scripts, and project metadata
- **.env.example**: Template for environment variables
- **docker-compose.yml**: Multi-container Docker setup
- **ecosystem.config.json**: PM2 process manager configuration

## Development Workflow

1. Environment setup using `.env.development`
2. Database initialization with `scripts/setup.js`
3. Development server with `npm run dev`
4. Database validation with `scripts/validate-db.js`

## Production Deployment

1. Environment setup using `.env.production`
2. Docker deployment with `docker-compose.yml`
3. Process management with `ecosystem.config.json`
4. Reverse proxy with `nginx/nginx.conf`
