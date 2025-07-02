# Jivhala Motors Backend API

A comprehensive vehicle management system backend built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with email/phone support
- **Vehicle Management**: Complete CRUD operations for vehicle listings
- **Export System**: PDF and Excel export functionality for vehicle data
- **File Upload**: Image upload support for vehicle photos
- **Security**: Rate limiting, helmet protection, input validation
- **Database**: MongoDB with Mongoose ODM
- **Documentation**: API documentation with Postman collections

## 📁 Project Structure

```
backend/
├── docs/                     # Documentation files
├── middleware/               # Express middleware
│   └── auth.js              # Authentication middleware
├── models/                  # MongoDB models
│   ├── User.js              # User schema
│   └── Vehicle.js           # Vehicle schema
├── nginx/                   # Nginx configuration
├── routes/                  # API routes
│   ├── auth.js              # Authentication routes
│   ├── export.js            # Export functionality routes
│   └── vehicles.js          # Vehicle management routes
├── scripts/                 # Utility scripts
│   ├── setup.js             # Initial setup script
│   ├── validate-db.js       # Database validation
│   └── deploy.*             # Deployment scripts
├── uploads/                 # File upload directory
│   └── vehicles/            # Vehicle images
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker compose configuration
├── Dockerfile               # Docker configuration
├── ecosystem.config.json    # PM2 configuration
├── package.json             # Dependencies and scripts
└── server.js                # Main application entry point
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prthamesh-pr/Backend.git
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run setup script**
   ```bash
   npm run setup
   ```

## 🚀 Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run prod
```

### Using Docker
```bash
docker-compose up -d
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create new vehicle
- `GET /api/vehicles/:id` - Get vehicle by ID
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Export
- `GET /api/export/pdf` - Export vehicles to PDF
- `GET /api/export/excel` - Export vehicles to Excel

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/jivhala_motors
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 🐳 Docker Support

The application includes Docker support with:
- Multi-stage builds for optimization
- Nginx reverse proxy configuration
- Health checks
- Volume mounting for persistent data

## 📊 Database

MongoDB collections:
- **users**: User authentication and profile data
- **vehicles**: Vehicle listings and metadata

## 🔒 Security

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet for security headers

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run setup` - Initialize application setup
- `npm run validate-db` - Validate database connection
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🚀 Deployment

The application is configured for deployment on:
- Render.com (see render.yaml)
- Docker containers
- Traditional VPS with PM2

## 📞 Support

For support and questions, contact the development team.

## 📄 License

This project is licensed under the MIT License.
