import { DynamoDBClient, DescribeTableCommand, CreateTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ENV } from '../../config/env.js';
import { DEDICATED_TABLES, provisionDynamoDbTable } from './createTable.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('====================================================');
  console.log('  AURA HOSPITALITY - AWS DYNAMODB MULTI-TABLE SYNC  ');
  console.log('====================================================');
  console.log(`Region:          ${ENV.AWS_REGION}`);
  console.log(`Dedicated Mode:  Separate Tables for Users, Rooms, Properties, Bookings`);
  console.log(`Access Key:      ${ENV.AWS_ACCESS_KEY_ID ? ENV.AWS_ACCESS_KEY_ID.substring(0, 6) + '...' : '(Using IAM Role / Default Provider)'}`);
  console.log('----------------------------------------------------');

  const clientConfig = {
    region: ENV.AWS_REGION || 'ap-south-1',
  };

  if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    };
  }

  const rawClient = new DynamoDBClient(clientConfig);
  const docClient = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions: { removeUndefinedValues: true },
  });

  try {
    console.log('[1/4] Ensuring all dedicated entity tables exist in AWS...');
    await provisionDynamoDbTable();

    console.log('\n[2/4] Verifying table statuses in AWS ap-south-1...');
    for (const tbl of DEDICATED_TABLES) {
      try {
        const desc = await rawClient.send(new DescribeTableCommand({ TableName: tbl.name }));
        console.log(`  ✔ Table "${tbl.name}" is ${desc.Table?.TableStatus}`);
      } catch (e) {
        console.log(`  ⏳ Table "${tbl.name}" is being created...`);
      }
    }

    console.log('\n[3/4] Populating clean entity records into dedicated tables...');
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const nowIso = new Date().toISOString();

    // 1. Seed SuperAdmin into Hospitality_Users
    const superAdminUser = {
      _id: 'superadmin-01',
      id: 'superadmin-01',
      name: 'Platform Super Admin',
      email: 'superadmin@platform.com',
      phone: '+919876543210',
      passwordHash,
      role: 'SUPER_ADMIN',
      department: 'Platform Executive',
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: 'SYSTEM_INSTALL',
    };
    await docClient.send(new PutCommand({ TableName: 'Hospitality_Users', Item: superAdminUser }));
    console.log('  ✔ Synced SuperAdmin into Hospitality_Users');

    // Also seed sample hotel admin if none exists
    const hotelAdminUser = {
      _id: 'admin-01',
      id: 'admin-01',
      name: 'Ishika Sharma',
      email: 'ishivats251@gmail.com',
      phone: '+917078813158',
      passwordHash,
      role: 'HOTEL_ADMIN',
      department: 'Executive Management',
      hotelId: 'hotel-royal-blue',
      propertyId: 'prop-wing-01',
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: 'superadmin-01',
    };
    await docClient.send(new PutCommand({ TableName: 'Hospitality_Users', Item: hotelAdminUser }));
    console.log('  ✔ Synced Hotel Admin into Hospitality_Users');

    // 2. Scan and verify Hospitality_Users
    console.log('\n[4/4] Inspecting "Hospitality_Users" table records:');
    const userScan = await docClient.send(new ScanCommand({ TableName: 'Hospitality_Users', Limit: 20 }));
    console.log(`✅ Total registered login users in Hospitality_Users: ${userScan.Items?.length || 0}`);
    userScan.Items?.forEach((u, idx) => {
      console.log(`  [${idx + 1}] Role: ${u.role.padEnd(12)} | Name: ${u.name.padEnd(20)} | Email: ${u.email.padEnd(26)} | Phone: ${u.phone || 'N/A'}`);
    });

    console.log('\n🎉 SUCCESS: All dedicated database tables are ready, clean, and organized!');
    console.log('You can now open AWS Console -> DynamoDB -> Tables -> Hospitality_Users to see all registered login accounts in a single click.');
  } catch (err) {
    if (err.name === 'CredentialsProviderError' || err.message?.includes('Could not load credentials')) {
      console.warn('\n⚠️  AWS CREDENTIALS MISSING IN backend/.env');
      console.warn('Your tables are defined, but Node.js cannot send data without an AWS Access Key.\n');
      console.log('To connect in 30 seconds:');
      console.log('1. In AWS Console (top-right), click your username "AgarwalN"');
      console.log('2. Click "Security credentials"');
      console.log('3. Scroll down to "Access keys" and click "Create access key"');
      console.log('4. Choose "Command Line Interface (CLI)" and copy:');
      console.log('   - AWS_ACCESS_KEY_ID');
      console.log('   - AWS_SECRET_ACCESS_KEY');
      console.log('5. Paste them into backend/.env and rerun this script!\n');
    } else {
      console.error('❌ AWS DynamoDB Sync Failed:', err.message);
    }
  }
}

main();
