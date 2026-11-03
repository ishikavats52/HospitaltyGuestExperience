import { GetCommand, PutCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient, TABLE_NAME } from '../../config/dynamodb.js';
import { ENV } from '../../config/env.js';

// Check whether AWS credentials or local DynamoDB endpoint are configured
const isExplicitOffline = ENV.DB_ENGINE === 'local';

export const DEDICATED_TABLE_MAP = {
  User: 'Hospitality_Users',
  Property: 'Hospitality_Properties',
  Room: 'Hospitality_Rooms',
  RoomType: 'Hospitality_RoomTypes',
  Booking: 'Hospitality_Bookings',
  Order: 'Hospitality_Orders',
  Guest: 'Hospitality_Guests',
  Department: 'Hospitality_Departments',
};

/**
 * Universal Repository for AWS DynamoDB Access:
 * Supports Dedicated Tables per Entity (Hospitality_Users, Hospitality_Rooms, etc.)
 * alongside backward-compatible Single-Table (HospitalityMainTable) dual-write.
 */
export class DynamoDbRepository {
  /**
   * Save entity to dedicated table (e.g. Hospitality_Users) and dual-write to HospitalityMainTable
   */
  static async putEntity(modelName, item) {
    const timestamp = new Date().toISOString();
    const id = String(item._id || item.id);
    const record = {
      ...item,
      _id: id,
      id: id,
      createdAt: item.createdAt || timestamp,
      updatedAt: timestamp,
    };

    if (isExplicitOffline) return record;

    // 1. Write to Dedicated Entity Table
    const dedicatedTable = DEDICATED_TABLE_MAP[modelName];
    if (dedicatedTable) {
      try {
        const cmd = new PutCommand({
          TableName: dedicatedTable,
          Item: record,
        });
        await ddbDocClient.send(cmd);
      } catch (err) {
        // Table might be initializing or permissions pending; continue gracefully
      }
    }

    // 2. Dual-write to HospitalityMainTable (Single-table fallback)
    try {
      const mainCmd = new PutCommand({
        TableName: TABLE_NAME,
        Item: record,
      });
      await ddbDocClient.send(mainCmd);
    } catch (err) {}

    return record;
  }

  /**
   * Fetch entity by ID from dedicated table, falling back to HospitalityMainTable
   */
  static async getEntity(modelName, id, pk, sk) {
    if (isExplicitOffline || !id) return null;
    const strId = String(id);

    const dedicatedTable = DEDICATED_TABLE_MAP[modelName];
    if (dedicatedTable) {
      try {
        const cmd = new GetCommand({
          TableName: dedicatedTable,
          Key: { _id: strId },
        });
        const res = await ddbDocClient.send(cmd);
        if (res.Item) return res.Item;
      } catch (err) {}
    }

    if (pk && sk) {
      return this.get(pk, sk);
    }
    return null;
  }

  /**
   * Delete entity from dedicated table and HospitalityMainTable
   */
  static async deleteEntity(modelName, id, pk, sk) {
    if (isExplicitOffline) return true;
    const strId = id ? String(id) : null;

    const dedicatedTable = DEDICATED_TABLE_MAP[modelName];
    if (dedicatedTable && strId) {
      try {
        const cmd = new DeleteCommand({
          TableName: dedicatedTable,
          Key: { _id: strId },
        });
        await ddbDocClient.send(cmd);
      } catch (err) {}
    }

    if (pk && sk) {
      try {
        const cmd = new DeleteCommand({
          TableName: TABLE_NAME,
          Key: { PK: pk, SK: sk },
        });
        await ddbDocClient.send(cmd);
      } catch (err) {}
    }

    return true;
  }

  /**
   * Retrieve all items for a model from its dedicated table or PK query
   */
  static async scanEntity(modelName, pk) {
    if (isExplicitOffline) return [];
    const dedicatedTable = DEDICATED_TABLE_MAP[modelName];
    if (dedicatedTable) {
      try {
        const cmd = new ScanCommand({ TableName: dedicatedTable });
        const res = await ddbDocClient.send(cmd);
        if (res.Items && res.Items.length > 0) {
          return res.Items;
        }
      } catch (err) {}
    }

    if (pk) {
      return this.queryByPk(pk);
    }
    return [];
  }

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
      return false;
    }
  }
}
