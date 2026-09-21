import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { ENV } from '../../config/env.js';

const clientConfig = {
  region: ENV.AWS_REGION || 'us-east-1',
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
const tableName = ENV.DYNAMODB_TABLE_NAME || 'HospitalityMainTable';

export const provisionDynamoDbTable = async () => {
  try {
    console.log(`[AWS DynamoDB] Checking table presence: ${tableName}...`);
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`[AWS DynamoDB] Table '${tableName}' already exists and is active.`);
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      console.log(`[AWS DynamoDB] Table '${tableName}' not found. Creating single-table schema...`);
      const createCmd = new CreateTableCommand({
        TableName: tableName,
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
      console.log(`[AWS DynamoDB] Table '${tableName}' created successfully with single-table design & GSI1!`);
    } else {
      console.error(`[AWS DynamoDB] Error creating table:`, err);
    }
  }
};

if (process.argv[1]?.endsWith('createTable.js')) {
  provisionDynamoDbTable();
}
