import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Import configurations and middleware
import { connectDatabase, syncDatabase } from '@/config/database';
import { errorHandler, notFound } from '@/middleware/errorHandler';
import { handleUnhandledRejections, handleUncaughtExceptions } from '@/middleware/errorHandler';

// Import routes
import authRoutes from '@/modules/auth/routes';
import userRoutes from '@/modules/users/routes';
import divisionRoutes from '@/modules/divisions/routes';

// Load environment variables
dotenv.config();

// Handle uncaught exceptions and unhandled rejections
handleUncaughtExceptions();
handleUnhandledRejections();

class App {
  public app: express.Application;
  private port: string | number;

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.',
      },
    });
    this.app.use('/api/', limiter);

    // General middleware
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // API info endpoint
    this.app.get('/api', (req, res) => {
      res.status(200).json({
        success: true,
        message: 'Tournament Management System API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          divisions: '/api/divisions',
          tournaments: '/api/tournaments',
          cups: '/api/cups',
          matches: '/api/matches',
        },
      });
    });
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/divisions', divisionRoutes);

    // TODO: Add remaining routes when modules are implemented
    // this.app.use('/api/tournaments', tournamentRoutes);
    // this.app.use('/api/cups', cupRoutes);
    // this.app.use('/api/matches', matchRoutes);
  }

  private initializeSwagger(): void {
    if (process.env.API_DOCS_ENABLED !== 'false') {
      const options = {
        definition: {
          openapi: '3.0.0',
          info: {
            title: 'Tournament Management System API',
            version: '1.0.0',
            description: 'A comprehensive tournament and league management system API',
            contact: {
              name: 'API Support',
              email: 'support@tournament.com',
            },
          },
          servers: [
            {
              url: `http://localhost:${this.port}`,
              description: 'Development server',
            },
          ],
          components: {
            securitySchemes: {
              bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
              },
            },
          },
          security: [
            {
              bearerAuth: [],
            },
          ],
        },
        apis: ['./src/modules/**/*.ts', './src/routes.ts'],
      };

      const specs = swaggerJsdoc(options);
      const docsPath = process.env.API_DOCS_PATH || '/api/docs';

      this.app.use(docsPath, swaggerUi.serve, swaggerUi.setup(specs, {
        explorer: true,
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Tournament Management System API Documentation',
      }));
    }
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFound);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();

      // Sync database (only in development)
      if (process.env.NODE_ENV === 'development') {
        await syncDatabase();
      }

      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 Server is running on port ${this.port}`);
        console.log(`📚 API Documentation: http://localhost:${this.port}${process.env.API_DOCS_PATH || '/api/docs'}`);
        console.log(`🏥 Health Check: http://localhost:${this.port}/health`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      });

    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start the application
const app = new App();
app.start();

export default app;