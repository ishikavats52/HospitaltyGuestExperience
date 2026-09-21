import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  
  // Database Configuration
  DB_ENGINE: process.env.DB_ENGINE || 'dynamodb',
  
  // AWS DynamoDB Configuration
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'local',
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'local',
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT || '',
  DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME || 'HospitalityMainTable',

  // JWT Secrets
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_hospitality_jwt_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super_secret_refresh_key_2026',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Redis / In-memory cache
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};
