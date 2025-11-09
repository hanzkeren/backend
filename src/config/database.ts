import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

// Parse DATABASE_URL or construct it from individual components
let databaseConfig: any;

if (process.env.DATABASE_URL) {
  databaseConfig = {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    logging: isProduction ? false : console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      ssl: isProduction ? {
        require: true,
        rejectUnauthorized: false,
      } : false,
    },
    define: {
      underscored: true,
      freezeTableName: true,
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  };
} else {
  // Fallback for development environments
  databaseConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'tournament_management',
    username: process.env.DB_USER || 'tms_user',
    password: process.env.DB_PASSWORD || 'tms_password',
    dialect: 'postgres',
    logging: !isProduction ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true,
      freezeTableName: true,
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  };
}

// Create Sequelize instance
const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, databaseConfig)
  : new Sequelize(
      databaseConfig.database,
      databaseConfig.username,
      databaseConfig.password,
      databaseConfig
    );

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Sync database (for development/testing)
export const syncDatabase = async (force = false): Promise<void> => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log(`✅ Database synchronized successfully (force: ${force}).`);
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
    throw error;
  }
};

// Close database connection
export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed successfully.');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

export default sequelize;