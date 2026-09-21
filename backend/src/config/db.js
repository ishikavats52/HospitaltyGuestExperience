import { ENV } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  try {
    const { provisionDynamoDbTable } = await import('../database/dynamodb/createTable.js');
    await provisionDynamoDbTable();
    isConnected = true;
    console.log(`[Database] AWS DynamoDB Engine Active: Table '${ENV.DYNAMODB_TABLE_NAME}' initialized.`);
  } catch (ddbErr) {
    console.warn(`[Database] AWS DynamoDB notice (${ddbErr.message}). Ready for AWS environment.`);
    isConnected = true;
  }
};

export const disconnectDB = async () => {
  isConnected = false;
};
