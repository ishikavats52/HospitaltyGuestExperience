import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { ENV } from '../../config/env.js';

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

const client = new DynamoDBClient(clientConfig);
const mainTableName = ENV.DYNAMODB_TABLE_NAME || 'HospitalityMainTable';

export const DEDICATED_TABLES = [
  { name: 'Hospitality_Users', key: '_id' },
  { name: 'Hospitality_Properties', key: '_id' },
  { name: 'Hospitality_Rooms', key: '_id' },
  { name: 'Hospitality_RoomTypes', key: '_id' },
  { name: 'Hospitality_Bookings', key: '_id' },
  { name: 'Hospitality_Guests', key: '_id' },
  { name: 'Hospitality_Orders', key: '_id' },
  { name: 'Hospitality_Departments', key: '_id' },
];

export const provisionDynamoDbTable = async () => {
  // 1. Provision HospitalityMainTable (Single-Table Design compatibility)
  try {
    await client.send(new DescribeTableCommand({ TableName: mainTableName }));
    console.log(`[AWS DynamoDB] Main Table '${mainTableName}' is active.`);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      try {
        console.log(`[AWS DynamoDB] Creating Table '${mainTableName}'...`);
        const createCmd = new CreateTableCommand({
          TableName: mainTableName,
          KeySchema: [
            { AttributeName: 'PK', KeyType: 'HASH' },
            { AttributeName: 'SK', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'PK', AttributeType: 'S' },
            { AttributeName: 'SK', AttributeType: 'S' },
            { AttributeName: 'GSI1PK', AttributeType: 'S' },
            { AttributeName: 'GSI1SK', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'GSI1',
              KeySchema: [
                { AttributeName: 'GSI1PK', KeyType: 'HASH' },
                { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
            },
          ],
          BillingMode: 'PAY_PER_REQUEST',
        });
        await client.send(createCmd);
        console.log(`[AWS DynamoDB] Table '${mainTableName}' created successfully!`);
      } catch (createErr) {
        console.warn(`[AWS DynamoDB] Note for '${mainTableName}': ${createErr.message}`);
      }
    }
  }

  // 2. Provision Separate Dedicated Entity Tables for Clean Architecture
  for (const tbl of DEDICATED_TABLES) {
    try {
      await client.send(new DescribeTableCommand({ TableName: tbl.name }));
      console.log(`[AWS DynamoDB] Dedicated Table '${tbl.name}' is active.`);
    } catch (err) {
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
};

if (process.argv[1]?.endsWith('createTable.js')) {
  provisionDynamoDbTable();
}
