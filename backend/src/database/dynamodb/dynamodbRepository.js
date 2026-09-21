import { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLE_NAME } from '../../config/dynamodb.js';

/**
 * Universal Repository for DynamoDB Single-Table Access
 */
export class DynamoDbRepository {
  static async get(pk, sk) {
    const cmd = new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: sk },
    });
    const result = await ddbDocClient.send(cmd);
    return result.Item || null;
  }

  static async put(item) {
    const cmd = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...item,
        updatedAt: new Date().toISOString(),
      },
    });
    await ddbDocClient.send(cmd);
    return item;
  }

  static async queryByPk(pk, skPrefix = null) {
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
  }

  static async queryGsi1(gsi1pk, gsi1skPrefix = null) {
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
  }
}
