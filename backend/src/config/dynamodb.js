import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { ENV } from './env.js';

const clientConfig = {
  region: ENV.AWS_REGION || 'ap-south-1',
};

if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
  };
}

if (ENV.DYNAMODB_ENDPOINT) {
  clientConfig.endpoint = ENV.DYNAMODB_ENDPOINT;
}

const rawClient = new DynamoDBClient(clientConfig);

export const ddbDocClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export const TABLE_NAME = ENV.DYNAMODB_TABLE_NAME;
