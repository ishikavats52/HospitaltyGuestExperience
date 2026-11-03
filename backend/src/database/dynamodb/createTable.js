import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ENV } from '../../config/env.js';
import { DiskStorage } from './diskStorage.js';

const clientConfig = {
  region: ENV.AWS_REGION || 'ap-south-1',
  maxAttempts: 1,
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

const client = new DynamoDBClient(clientConfig);
const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

export const DEDICATED_TABLES = [
  { name: 'Hospitality_Users', key: '_id' },
  { name: 'Hospitality_Hotels', key: '_id' },
  { name: 'Hospitality_Properties', key: '_id' },
  { name: 'Hospitality_Rooms', key: '_id' },
  { name: 'Hospitality_RoomTypes', key: '_id' },
  { name: 'Hospitality_Bookings', key: '_id' },
  { name: 'Hospitality_Guests', key: '_id' },
  { name: 'Hospitality_Departments', key: '_id' },
  { name: 'Hospitality_Stays', key: '_id' },
  { name: 'Hospitality_Orders', key: '_id' },
  { name: 'Hospitality_MenuCategories', key: '_id' },
  { name: 'Hospitality_MenuItems', key: '_id' },
  { name: 'Hospitality_Billings', key: '_id' },
  { name: 'Hospitality_Feedbacks', key: '_id' },
  { name: 'Hospitality_Services', key: '_id' },
  { name: 'Hospitality_ServiceCatalogues', key: '_id' },
  { name: 'Hospitality_ServiceAvailabilities', key: '_id' },
  { name: 'Hospitality_SubscriptionPlans', key: '_id' },
  { name: 'Hospitality_HotelSubscriptions', key: '_id' },
  { name: 'Hospitality_Locations', key: '_id' },
];

/**
 * Migrate legacy records from HospitalityMainTable into dedicated tables
 */
async function migrateLegacyMainTable() {
  const legacyTableName = ENV.DYNAMODB_TABLE_NAME || 'HospitalityMainTable';
  try {
    const scanRes = await docClient.send(new ScanCommand({ TableName: legacyTableName, Limit: 500 }));
    const items = scanRes.Items || [];
    if (items.length === 0) return;

    console.log(`[AWS DynamoDB Migration] Found ${items.length} item(s) in '${legacyTableName}'. Ingesting into dedicated tables...`);

    const tablePrefixMap = {
      'USER': 'Hospitality_Users',
      'HOTEL': 'Hospitality_Hotels',
      'PROPERTY': 'Hospitality_Properties',
      'ROOM': 'Hospitality_Rooms',
      'ROOMTYPE': 'Hospitality_RoomTypes',
      'BOOKING': 'Hospitality_Bookings',
      'GUEST': 'Hospitality_Guests',
      'DEPARTMENT': 'Hospitality_Departments',
      'STAY': 'Hospitality_Stays',
      'ORDER': 'Hospitality_Orders',
      'MENUCATEGORY': 'Hospitality_MenuCategories',
      'MENUITEM': 'Hospitality_MenuItems',
      'BILLING': 'Hospitality_Billings',
      'FEEDBACK': 'Hospitality_Feedbacks',
      'HOTELSERVICE': 'Hospitality_Services',
      'SERVICECATALOGUE': 'Hospitality_ServiceCatalogues',
      'SERVICEAVAILABILITY': 'Hospitality_ServiceAvailabilities',
      'SUBSCRIPTIONPLAN': 'Hospitality_SubscriptionPlans',
      'HOTELSUBSCRIPTION': 'Hospitality_HotelSubscriptions',
      'LOCATION': 'Hospitality_Locations',
    };

    let migratedCount = 0;
    for (const item of items) {
      let targetTable = null;
      for (const [prefix, tableName] of Object.entries(tablePrefixMap)) {
        if (
          item.PK === `ENTITY#${prefix}` ||
          item.SK?.startsWith(`${prefix}#`) ||
          (item.role && prefix === 'USER') ||
          (item.bookingNumber && prefix === 'BOOKING') ||
          (item.roomNumber && prefix === 'ROOM')
        ) {
          targetTable = tableName;
          break;
        }
      }

      if (targetTable) {
        const id = String(item._id || item.id || (item.SK ? item.SK.split('#')[1] : null));
        if (id) {
          const cleanRecord = { ...item, _id: id, id };
          try {
            await docClient.send(new PutCommand({ TableName: targetTable, Item: cleanRecord }));
            // Also store to persistent disk
            const existing = DiskStorage.readTable(targetTable);
            if (!existing.some((e) => String(e._id || e.id) === id)) {
              existing.push(cleanRecord);
              DiskStorage.writeTable(targetTable, existing);
            }
            migratedCount++;
          } catch (e) {}
        }
      }
    }

    if (migratedCount > 0) {
      console.log(`[AWS DynamoDB Migration] Ingested ${migratedCount} record(s) into separate dedicated tables.`);
    }
  } catch (err) {
    // If HospitalityMainTable doesn't exist or isn't accessible, proceed cleanly
  }
}

export const provisionDynamoDbTable = async () => {
  let credentialsFailed = false;

  // Provision Separate Dedicated Entity Tables for Clean Architecture
  for (const tbl of DEDICATED_TABLES) {
    if (credentialsFailed) break;
    try {
      await client.send(new DescribeTableCommand({ TableName: tbl.name }));
      console.log(`[AWS DynamoDB] Dedicated Table '${tbl.name}' is active.`);
    } catch (err) {
      if (
        err.name === 'CredentialsProviderError' ||
        err.message?.includes('Could not load credentials') ||
        err.message?.includes('credentials')
      ) {
        console.warn(`[AWS DynamoDB Notice]: Credentials not active in environment. Operating with durable disk persistence.`);
        credentialsFailed = true;
        break;
      }
      if (err.name === 'ResourceNotFoundException') {
        try {
          console.log(`[AWS DynamoDB] Creating Dedicated Entity Table '${tbl.name}'...`);
          const createCmd = new CreateTableCommand({
            TableName: tbl.name,
            KeySchema: [{ AttributeName: tbl.key, KeyType: 'HASH' }],
            AttributeDefinitions: [{ AttributeName: tbl.key, AttributeType: 'S' }],
            BillingMode: 'PAY_PER_REQUEST',
          });
          await client.send(createCmd);
          console.log(`[AWS DynamoDB] Dedicated Table '${tbl.name}' created successfully!`);
        } catch (createErr) {
          console.warn(`[AWS DynamoDB] Note for '${tbl.name}': ${createErr.message}`);
        }
      }
    }
  }

  if (!credentialsFailed) {
    // Attempt migration from legacy single-table if records exist
    await migrateLegacyMainTable();
  }
};

if (process.argv[1]?.endsWith('createTable.js')) {
  provisionDynamoDbTable();
}
