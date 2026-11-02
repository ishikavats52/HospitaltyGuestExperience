import { GetCommand, PutCommand, QueryCommand, ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLE_NAME } from '../../config/dynamodb.js';
import { ENV } from '../../config/env.js';

// Check whether AWS credentials or local DynamoDB endpoint are configured
const hasAwsAuth = Boolean(
  (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) ||
  ENV.DYNAMODB_ENDPOINT
);

if (!hasAwsAuth) {
  console.warn(
    `[AWS DynamoDB Info] No AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY set in backend/.env. Using local fallback cache. Set your AWS credentials in backend/.env to write directly to "${TABLE_NAME}" in region "${ENV.AWS_REGION}".`
  );
}

/**
 * Universal Repository for AWS DynamoDB Single-Table Access
 */
export class DynamoDbRepository {
  static async get(pk, sk) {
    if (!hasAwsAuth) return null;
    try {
      const cmd = new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk },
      });
      const result = await ddbDocClient.send(cmd);
      return result.Item || null;
    } catch (err) {
      console.error(`[DynamoDB Get Error]:`, err.message);
      return null;
    }
  }

  static async put(item) {
    const timestamp = new Date().toISOString();
    const record = {
      ...item,
      createdAt: item.createdAt || timestamp,
      updatedAt: timestamp,
    };
    if (!hasAwsAuth) return record;

    try {
      const cmd = new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      });
      await ddbDocClient.send(cmd);
      return record;
    } catch (err) {
      console.error(`[DynamoDB Put Error on ${TABLE_NAME}]:`, err.message);
      return item;
    }
  }

  static async queryByPk(pk, skPrefix = null) {
    if (!hasAwsAuth) return [];
    try {
      let keyCondition = 'PK = :pk';
      const expressionAttributeValues = { ':pk': pk };

      if (skPrefix) {
        keyCondition += ' AND begins_with(SK, :skPrefix)';
        expressionAttributeValues[':skPrefix'] = skPrefix;
      }

      const cmd = new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: keyCondition,
        ExpressionAttributeValues: expressionAttributeValues,
      });
      const result = await ddbDocClient.send(cmd);
      return result.Items || [];
    } catch (err) {
      console.error(`[DynamoDB Query Error]:`, err.message);
      return [];
    }
  }

  static async queryGsi1(gsi1pk, gsi1skPrefix = null) {
    if (!hasAwsAuth) return [];
    try {
      let keyCondition = 'GSI1PK = :gsi1pk';
      const expressionAttributeValues = { ':gsi1pk': gsi1pk };

      if (gsi1skPrefix) {
        keyCondition += ' AND begins_with(GSI1SK, :gsi1skPrefix)';
        expressionAttributeValues[':gsi1skPrefix'] = gsi1skPrefix;
      }

      const cmd = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'GSI1',
        KeyConditionExpression: keyCondition,
        ExpressionAttributeValues: expressionAttributeValues,
      });
      const result = await ddbDocClient.send(cmd);
      return result.Items || [];
    } catch (err) {
      console.error(`[DynamoDB GSI1 Query Error]:`, err.message);
      return [];
    }
  }

  static async scan(skPrefix = null) {
    if (!hasAwsAuth) return [];
    try {
      const params = { TableName: TABLE_NAME };
      if (skPrefix) {
        params.FilterExpression = 'begins_with(SK, :skPrefix)';
        params.ExpressionAttributeValues = { ':skPrefix': skPrefix };
      }
      const cmd = new ScanCommand(params);
      const result = await ddbDocClient.send(cmd);
      return result.Items || [];
    } catch (err) {
      console.error(`[DynamoDB Scan Error]:`, err.message);
      return [];
    }
  }

  static async delete(pk, sk) {
    if (!hasAwsAuth) return true;
    try {
      const cmd = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk },
      });
      await ddbDocClient.send(cmd);
      return true;
    } catch (err) {
      console.error(`[DynamoDB Delete Error]:`, err.message);
      return false;
    }
  }
}
