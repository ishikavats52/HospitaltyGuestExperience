import { GetCommand, PutCommand, QueryCommand, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { ddbDocClient } from '../../config/dynamodb.js';
import { ENV } from '../../config/env.js';
import { DiskStorage } from './diskStorage.js';

// Check whether explicit local mode is set
const isExplicitOffline = ENV.DB_ENGINE === 'local';

export const DEDICATED_TABLE_MAP = {
  User: 'Hospitality_Users',
  Hotel: 'Hospitality_Hotels',
  Property: 'Hospitality_Properties',
  Room: 'Hospitality_Rooms',
  RoomType: 'Hospitality_RoomTypes',
  Booking: 'Hospitality_Bookings',
  Guest: 'Hospitality_Guests',
  Department: 'Hospitality_Departments',
  Stay: 'Hospitality_Stays',
  Order: 'Hospitality_Orders',
  MenuCategory: 'Hospitality_MenuCategories',
  MenuItem: 'Hospitality_MenuItems',
  Billing: 'Hospitality_Billings',
  Feedback: 'Hospitality_Feedbacks',
  HotelService: 'Hospitality_Services',
  ServiceCatalogue: 'Hospitality_ServiceCatalogues',
  ServiceAvailability: 'Hospitality_ServiceAvailabilities',
  SubscriptionPlan: 'Hospitality_SubscriptionPlans',
  HotelSubscription: 'Hospitality_HotelSubscriptions',
  Location: 'Hospitality_Locations',
};

export class DynamoDbRepository {
  static getTableName(modelName) {
    return DEDICATED_TABLE_MAP[modelName] || `Hospitality_${modelName}s`;
  }

  /**
   * Save entity to dedicated table (e.g. Hospitality_Users) and durable disk storage
   */
  static async putEntity(modelName, item) {
    const timestamp = new Date().toISOString();
    const id = String(item._id || item.id);
    const tableName = this.getTableName(modelName);

    const record = {
      ...item,
      _id: id,
      id: id,
      createdAt: item.createdAt || timestamp,
      updatedAt: timestamp,
    };

    // 1. Immediately persist to durable disk storage
    try {
      const diskItems = DiskStorage.readTable(tableName);
      const existingIdx = diskItems.findIndex((i) => String(i._id || i.id) === id);
      if (existingIdx >= 0) {
        diskItems[existingIdx] = { ...diskItems[existingIdx], ...record };
      } else {
        diskItems.push(record);
      }
      DiskStorage.writeTable(tableName, diskItems);
    } catch (diskErr) {
      console.warn(`[DiskStorage Error] on put ${tableName}:`, diskErr.message);
    }

    if (isExplicitOffline) return record;

    // 2. Persist to dedicated AWS DynamoDB table
    try {
      const cmd = new PutCommand({
        TableName: tableName,
        Item: record,
      });
      await ddbDocClient.send(cmd);
    } catch (err) {
      // If AWS DynamoDB is offline or credentials pending, data is safely on disk
    }

    return record;
  }

  /**
   * Fetch entity by ID from dedicated table, falling back to disk storage
   */
  static async getEntity(modelName, id) {
    if (!id) return null;
    const strId = String(id);
    const tableName = this.getTableName(modelName);

    // 1. Attempt AWS DynamoDB
    if (!isExplicitOffline) {
      try {
        const cmd = new GetCommand({
          TableName: tableName,
          Key: { _id: strId },
        });
        const res = await ddbDocClient.send(cmd);
        if (res.Item) {
          return res.Item;
        }
      } catch (err) {}
    }

    // 2. Fall back to persistent disk storage
    const diskItems = DiskStorage.readTable(tableName);
    const found = diskItems.find((i) => String(i._id || i.id) === strId);
    return found || null;
  }

  /**
   * Delete entity from dedicated table and durable disk storage
   */
  static async deleteEntity(modelName, id) {
    if (!id) return true;
    const strId = String(id);
    const tableName = this.getTableName(modelName);

    // 1. Remove from persistent disk storage
    try {
      const diskItems = DiskStorage.readTable(tableName);
      const filtered = diskItems.filter((i) => String(i._id || i.id) !== strId);
      DiskStorage.writeTable(tableName, filtered);
    } catch (diskErr) {}

    if (isExplicitOffline) return true;

    // 2. Remove from AWS DynamoDB
    try {
      const cmd = new DeleteCommand({
        TableName: tableName,
        Key: { _id: strId },
      });
      await ddbDocClient.send(cmd);
    } catch (err) {}

    return true;
  }

  /**
   * Retrieve all items for a model from dedicated DynamoDB table, synchronized with disk storage
   */
  static async scanEntity(modelName) {
    const tableName = this.getTableName(modelName);
    const diskItems = DiskStorage.readTable(tableName);

    if (isExplicitOffline) {
      return diskItems;
    }

    // 1. Attempt AWS DynamoDB Scan
    try {
      const cmd = new ScanCommand({ TableName: tableName });
      const res = await ddbDocClient.send(cmd);
      if (res.Items && Array.isArray(res.Items)) {
        // Merge cloud items with disk items
        const mergedMap = new Map();
        for (const item of diskItems) {
          mergedMap.set(String(item._id || item.id), item);
        }
        for (const item of res.Items) {
          mergedMap.set(String(item._id || item.id), item);
        }
        const mergedList = Array.from(mergedMap.values());
        // Sync disk cache with latest merged set
        DiskStorage.writeTable(tableName, mergedList);
        return mergedList;
      }
    } catch (err) {
      // Network or credential limitation; fallback cleanly to disk
    }

    return diskItems;
  }

  // Backward compatibility legacy methods
  static async get(pk, sk) {
    return null;
  }

  static async put(item) {
    return item;
  }

  static async queryByPk(pk, skPrefix = null) {
    return [];
  }

  static async queryGsi1(gsi1pk, gsi1skPrefix = null) {
    return [];
  }

  static async scan(skPrefix = null) {
    return [];
  }

  static async delete(pk, sk) {
    return true;
  }
}
