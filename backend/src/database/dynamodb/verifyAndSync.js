import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ENV } from '../../config/env.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('====================================================');
  console.log('  AURA HOSPITALITY - AWS DYNAMODB SYNC & VERIFIER   ');
  console.log('====================================================');
  console.log(`Region:     ${ENV.AWS_REGION}`);
  console.log(`Table Name: ${ENV.DYNAMODB_TABLE_NAME}`);
  console.log(`Access Key: ${ENV.AWS_ACCESS_KEY_ID ? ENV.AWS_ACCESS_KEY_ID.substring(0, 6) + '...' : '(Not provided yet)'}`);
  console.log('----------------------------------------------------');

  if (!ENV.AWS_ACCESS_KEY_ID || !ENV.AWS_SECRET_ACCESS_KEY) {
    console.warn('\n⚠️  AWS CREDENTIALS MISSING IN backend/.env');
    console.warn('Your table "HospitalityMainTable" is live in AWS ap-south-1, but');
    console.warn('Node.js cannot send data without an AWS Access Key.\n');
    console.log('To connect in 30 seconds:');
    console.log('1. In AWS Console (top-right), click your username "AgarwalN"');
    console.log('2. Click "Security credentials"');
    console.log('3. Scroll down to "Access keys" and click "Create access key"');
    console.log('4. Choose "Command Line Interface (CLI)" and copy:');
    console.log('   - AWS_ACCESS_KEY_ID');
    console.log('   - AWS_SECRET_ACCESS_KEY');
    console.log('5. Paste them into backend/.env and rerun this script!\n');
    return;
  }

  const rawClient = new DynamoDBClient({
    region: ENV.AWS_REGION,
    credentials: {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    },
  });

  const docClient = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions: { removeUndefinedValues: true },
  });

  try {
    console.log(`[1/3] Pinging table "${ENV.DYNAMODB_TABLE_NAME}" in ${ENV.AWS_REGION}...`);
    const desc = await rawClient.send(new DescribeTableCommand({ TableName: ENV.DYNAMODB_TABLE_NAME }));
    console.log(`✅ Table is ${desc.Table?.TableStatus} in AWS account.`);

    console.log(`\n[2/3] Writing platform records into ${ENV.DYNAMODB_TABLE_NAME}...`);
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const nowIso = new Date().toISOString();

    // 1. Seed SuperAdmin
    const superAdminRecord = {
      PK: 'ENTITY#USER',
      SK: 'USER#superadmin-01',
      _id: 'superadmin-01',
      id: 'superadmin-01',
      name: 'Platform Super Admin',
      email: 'superadmin@platform.com',
      phone: '+919876543210',
      passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    await docClient.send(new PutCommand({ TableName: ENV.DYNAMODB_TABLE_NAME, Item: superAdminRecord }));
    console.log('  ✔ Created SuperAdmin profile in DynamoDB (PK: ENTITY#USER)');

    // 2. Scan and verify
    console.log(`\n[3/3] Scanning "${ENV.DYNAMODB_TABLE_NAME}" items...`);
    const scanRes = await docClient.send(new ScanCommand({ TableName: ENV.DYNAMODB_TABLE_NAME, Limit: 10 }));
    console.log(`✅ Scan successful! Items currently in AWS DynamoDB: ${scanRes.Items?.length || 0}`);
    scanRes.Items?.forEach((item, idx) => {
      console.log(`  [${idx + 1}] PK: ${item.PK} | SK: ${item.SK} | Name: ${item.name || item.roomNumber || item.email || item._id}`);
    });

    console.log('\n🎉 ALL CHECKS PASSED: Your application is now live-writing to AWS DynamoDB!');
  } catch (err) {
    console.error('❌ AWS DynamoDB Connection Failed:', err.message);
  }
}

main();
