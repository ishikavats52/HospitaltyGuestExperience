import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  try {
    // 1. Connect to Database (with zero-config in-memory fallback)
    await connectDB();

    // 2. Start HTTP listener
    app.listen(ENV.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`🏨 Hospitality Guest Experience Platform API is running`);
      logger.info(`🌐 Mode: ${ENV.NODE_ENV} | Port: ${ENV.PORT}`);
      logger.info(`🔗 Base URL: http://localhost:${ENV.PORT}`);
      logger.info(`⚡ API Base: http://localhost:${ENV.PORT}/api/v1`);
      logger.info(`=======================================================`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
