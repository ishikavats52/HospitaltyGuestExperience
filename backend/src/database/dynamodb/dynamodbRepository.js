import { GetCommand, PutCommand, QueryCommand, ScanCommand, DeleteCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLE_NAME } from '../../config/dynamodb.js';
import { ENV } from '../../config/env.js';

// Check whether AWS credentials or local DynamoDB endpoint are configured
const isExplicitOffline = ENV.DB_ENGINE === 'local';

/**
 * Universal Repository for AWS DynamoDB Single-Table Access
 */
export class DynamoDbRepository {
  static async get(pk, sk) {
    if (isExplicitOffline) return null;
    try {
      const cmd = new GetCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk },
      });
      const result = await ddbDocClient.send(cmd);
      return result.Item || null;
    } catch (err) {
      console.warn(`[DynamoDB Get Info]: ${err.message}`);
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
    if (isExplicitOffline) return record;

    try {
      const cmd = new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      });
      await ddbDocClient.send(cmd);
      return record;
    } catch (err) {
      console.warn(`[DynamoDB Put Info on ${TABLE_NAME}]: ${err.message}`);
      return item;
    }
  }

  static async queryByPk(pk, skPrefix = null) {
    if (isExplicitOffline) return [];
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
      console.warn(`[DynamoDB Query Info]: ${err.message}`);
      return [];
    }
  }

  static async queryGsi1(gsi1pk, gsi1skPrefix = null) {
    if (isExplicitOffline) return [];
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
      console.warn(`[DynamoDB GSI1 Query Info]: ${err.message}`);
      return [];
    }
  }

  static async scan(skPrefix = null) {
    if (isExplicitOffline) return [];
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
      console.warn(`[DynamoDB Scan Info]: ${err.message}`);
      return [];
    }
  }

  static async delete(pk, sk) {
    if (isExplicitOffline) return true;
    try {
      const cmd = new DeleteCommand({
        TableName: TABLE_NAME,
        Key: { PK: pk, SK: sk },
      });
      await ddbDocClient.send(cmd);
      return true;
    } catch (err) {
      console.warn(`[DynamoDB Delete Info]: ${err.message}`);
      return false;
    }
  }
}
