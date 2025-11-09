# Tournament Management System

A comprehensive Node.js + TypeScript tournament and league management system with PostgreSQL database, JWT authentication, and RESTful API.

## Features

- ✅ **User Authentication & Authorization**: JWT-based auth with refresh tokens and role-based access control
- ✅ **Database Management**: Sequelize ORM with PostgreSQL, migrations, and seeders
- ✅ **User Management**: Full CRUD operations with pagination and filtering
- ✅ **Division Management**: Organize competitions by divisions
- ✅ **Containerized**: Docker and Docker Compose setup
- ✅ **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- ✅ **Code Quality**: ESLint, Prettier, and TypeScript with strict mode

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT with refresh tokens, bcryptjs
- **Validation**: Joi schemas
- **Documentation**: Swagger/OpenAPI
- **Containerization**: Docker, Docker Compose
- **Code Quality**: ESLint, Prettier

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (or use Docker Compose)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd tournament-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start with Docker Compose:
```bash
docker-compose up -d
```

5. Or run locally:
```bash
# Start PostgreSQL
# Run migrations and seeders
npm run db:reset

# Start development server
npm run dev
```

### Environment Variables

Key environment variables (see `.env.example`):

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT access tokens
- `JWT_REFRESH_SECRET`: Secret for JWT refresh tokens
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)

## API Documentation

Once the server is running, visit:
- **API Docs**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

## Available Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Users (Admin only)
- `GET /api/users` - List users with pagination
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Divisions
- `GET /api/divisions` - List divisions
- `POST /api/divisions` - Create division (admin)
- `PUT /api/divisions/:id` - Update division (admin)
- `DELETE /api/divisions/:id` - Delete division (admin)

## Database Schema

The system includes models for:
- **Users**: Authentication and user management
- **Divisions**: Competition divisions
- **Tournaments**: Tournament management
- **Cups**: Cup competitions
- **Matches**: Match scheduling and results
- **Brackets**: Tournament brackets
- **Leaderboards**: Competition standings

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

### Database Operations

- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Undo last migration
- `npm run seed` - Run database seeders
- `npm run db:reset` - Reset and reseed database

## Default Users

After running seeders, you can use these default accounts:

- **Super Admin**: `superadmin@tournament.com` / `SuperAdmin123!`
- **Admin**: `admin@tournament.com` / `Admin123!`
- **User**: `john.doe@example.com` / `User123!`

## Project Structure

```
src/
├── config/          # Database and app configuration
├── middleware/      # Express middleware (auth, validation, error handling)
├── modules/         # Feature modules (auth, users, divisions, etc.)
│   ├── auth/        # Authentication module
│   ├── users/       # User management
│   └── divisions/   # Division management
├── models/          # Sequelize models
├── services/        # Business logic services
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure code passes linting
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- Tournament and Cup modules
- Match management system
- Bracket generation services
- Leaderboard computation
- Email verification
- Password reset functionality
- File upload for team logos
- Real-time match updates
- Advanced reporting and analytics