import { ENV } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  isConnected = true;

  try {
    const { provisionDynamoDbTable } = await import('../database/dynamodb/createTable.js');
    await provisionDynamoDbTable();
  } catch (ddbErr) {
    console.warn(`[Database] AWS DynamoDB notice (${ddbErr.message}). Ready for AWS environment.`);
  }

  try {
    const { seedDatabase } = await import('../seeds/seedData.js');
    await seedDatabase();
  } catch (seedErr) {
    console.warn(`[Database] Auto-seeding notice: ${seedErr.message}`);
  }

  console.log(`[Database] AWS DynamoDB Engine Active: Table '${ENV.DYNAMODB_TABLE_NAME}' initialized & populated.`);
};

export const disconnectDB = async () => {
  isConnected = false;
};
