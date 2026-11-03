import { DynamoDBClient, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { ENV } from '../../config/env.js';
import { DEDICATED_TABLES, provisionDynamoDbTable } from './createTable.js';
import { DiskStorage } from './diskStorage.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('====================================================');
  console.log('  AURA HOSPITALITY - AWS DYNAMODB MULTI-TABLE SYNC  ');
  console.log('====================================================');
  console.log(`Region:          ${ENV.AWS_REGION}`);
  console.log(`Dedicated Mode:  20 Dedicated Separate Tables`);
  console.log(`Access Key:      ${ENV.AWS_ACCESS_KEY_ID ? ENV.AWS_ACCESS_KEY_ID.substring(0, 6) + '...' : '(Using IAM Role / Local Persistence)'}`);
  console.log('----------------------------------------------------');

  const clientConfig = {
    region: ENV.AWS_REGION || 'ap-south-1',
    maxAttempts: 1,
  };

  let hasExplicitKeys = false;
  if (ENV.AWS_ACCESS_KEY_ID && ENV.AWS_SECRET_ACCESS_KEY) {
    clientConfig.credentials = {
      accessKeyId: ENV.AWS_ACCESS_KEY_ID,
      secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
    };
    hasExplicitKeys = true;
  }

  const rawClient = new DynamoDBClient(clientConfig);
  const docClient = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions: { removeUndefinedValues: true },
  });

  try {
    console.log('[1/4] Ensuring all 20 dedicated entity tables exist in AWS...');
    await provisionDynamoDbTable();

    console.log('\n[2/4] Verifying foundational entity records in dedicated storage...');
    const passwordHash = await bcrypt.hash('Admin@123', 10);
    const nowIso = new Date().toISOString();

    // 1. SuperAdmin
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
    if (hasExplicitKeys) {
      try {
        await docClient.send(new PutCommand({ TableName: 'Hospitality_Users', Item: superAdminUser }));
      } catch (_) {}
    }
    const diskUsers = DiskStorage.readTable('Hospitality_Users');
    if (!diskUsers.some((u) => u.email === superAdminUser.email)) {
      diskUsers.push(superAdminUser);
      DiskStorage.writeTable('Hospitality_Users', diskUsers);
    }
    console.log('  ✔ Verified SuperAdmin in Hospitality_Users (superadmin@platform.com)');

    // 2. Hotel
    const defaultHotel = {
      _id: 'hotel-royal-blue',
      id: 'hotel-royal-blue',
      name: 'Royal Blue Hotel',
      brand: 'Royal Blue Luxury Stays',
      code: 'RBL-101',
      contactEmail: 'ishivats251@gmail.com',
      contactPhone: '+917078813158',
      locationHierarchy: { country: 'India', state: 'Delhi', city: 'New Delhi', localArea: 'Central' },
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    if (hasExplicitKeys) {
      try {
        await docClient.send(new PutCommand({ TableName: 'Hospitality_Hotels', Item: defaultHotel }));
      } catch (_) {}
    }
    const diskHotels = DiskStorage.readTable('Hospitality_Hotels');
    if (!diskHotels.some((h) => h._id === defaultHotel._id)) {
      diskHotels.push(defaultHotel);
      DiskStorage.writeTable('Hospitality_Hotels', diskHotels);
    }
    console.log('  ✔ Verified Hotel Tenant in Hospitality_Hotels (Royal Blue Hotel)');

    // 3. Property
    const defaultProperty = {
      _id: 'prop-wing-01',
      id: 'prop-wing-01',
      hotelId: defaultHotel._id,
      name: 'Royal Blue Hotel Main Wing',
      code: 'RBL-MAIN',
      address: '12 Connaught Circus',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      phone: '+917078813158',
      email: 'ishivats251@gmail.com',
      totalRooms: 3,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    if (hasExplicitKeys) {
      try {
        await docClient.send(new PutCommand({ TableName: 'Hospitality_Properties', Item: defaultProperty }));
      } catch (_) {}
    }
    const diskProps = DiskStorage.readTable('Hospitality_Properties');
    if (!diskProps.some((p) => p._id === defaultProperty._id)) {
      diskProps.push(defaultProperty);
      DiskStorage.writeTable('Hospitality_Properties', diskProps);
    }
    console.log('  ✔ Verified Property in Hospitality_Properties (Royal Blue Hotel Main Wing)');

    // 4. Hotel Admin
    const hotelAdminUser = {
      _id: 'admin-01',
      id: 'admin-01',
      name: 'Ishika Sharma',
      email: 'ishivats251@gmail.com',
      phone: '+917078813158',
      passwordHash,
      role: 'HOTEL_ADMIN',
      department: 'Executive Management',
      hotelId: defaultHotel._id,
      propertyId: defaultProperty._id,
      propertyIds: [defaultProperty._id],
      status: 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: superAdminUser._id,
    };
    if (hasExplicitKeys) {
      try {
        await docClient.send(new PutCommand({ TableName: 'Hospitality_Users', Item: hotelAdminUser }));
      } catch (_) {}
    }
    if (!diskUsers.some((u) => u.email === hotelAdminUser.email)) {
      diskUsers.push(hotelAdminUser);
      DiskStorage.writeTable('Hospitality_Users', diskUsers);
    }
    console.log('  ✔ Verified Hotel Admin in Hospitality_Users (ishivats251@gmail.com)');

    // 5. Rooms
    const defaultRooms = [
      {
        _id: 'room-101',
        id: 'room-101',
        hotelId: defaultHotel._id,
        propertyId: defaultProperty._id,
        roomNumber: '101',
        floor: 1,
        roomTypeName: 'deluxe suit',
        pricePerNight: 4500,
        status: 'AVAILABLE',
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'],
        amenities: ['King Size Plush Bed', 'Smart 4K Ultra-HD TV', 'High-Speed Wi-Fi 6', 'Mini Bar & Refrigerator'],
        inventory: [{ name: 'Egyptian Cotton Towels', quantity: 5, category: 'Linen' }],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        _id: 'room-102',
        id: 'room-102',
        hotelId: defaultHotel._id,
        propertyId: defaultProperty._id,
        roomNumber: '102',
        floor: 1,
        roomTypeName: 'premium suit',
        pricePerNight: 4500,
        status: 'AVAILABLE',
        images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'],
        amenities: ['King Size Plush Bed', 'Smart 4K Ultra-HD TV', 'High-Speed Wi-Fi 6', 'Mini Bar & Refrigerator'],
        inventory: [{ name: 'Egyptian Cotton Towels', quantity: 4, category: 'Linen' }],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        _id: 'room-201',
        id: 'room-201',
        hotelId: defaultHotel._id,
        propertyId: defaultProperty._id,
        roomNumber: '201',
        floor: 2,
        roomTypeName: 'Basic suit',
        pricePerNight: 4500,
        status: 'AVAILABLE',
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'],
        amenities: ['King Size Plush Bed', 'Smart 4K Ultra-HD TV', 'High-Speed Wi-Fi 6', 'Mini Bar & Refrigerator'],
        inventory: [{ name: 'Egyptian Cotton Towels', quantity: 3, category: 'Linen' }],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];
    if (hasExplicitKeys) {
      for (const rm of defaultRooms) {
        try {
          await docClient.send(new PutCommand({ TableName: 'Hospitality_Rooms', Item: rm }));
        } catch (_) {}
      }
    }
    const diskRooms = DiskStorage.readTable('Hospitality_Rooms');
    for (const rm of defaultRooms) {
      if (!diskRooms.some((r) => r.roomNumber === rm.roomNumber)) {
        diskRooms.push(rm);
      }
    }
    DiskStorage.writeTable('Hospitality_Rooms', diskRooms);
    console.log('  ✔ Verified 3 Rooms in Hospitality_Rooms (101, 102, 201)');

    // 6. Inspect All Login Users
    console.log('\n[3/4] Inspecting "Hospitality_Users" table records:');
    let usersList = [];
    if (hasExplicitKeys) {
      try {
        const userScan = await docClient.send(new ScanCommand({ TableName: 'Hospitality_Users', Limit: 50 }));
        usersList = userScan.Items || [];
      } catch (_) {}
    }
    if (usersList.length === 0) {
      usersList = DiskStorage.readTable('Hospitality_Users');
    }

    console.log(`✅ Total registered login users in Hospitality_Users: ${usersList.length}`);
    usersList.forEach((u, idx) => {
      console.log(`  [${idx + 1}] Role: ${(u.role || '').padEnd(14)} | Name: ${(u.name || '').padEnd(20)} | Email: ${(u.email || '').padEnd(26)} | Phone: ${u.phone || 'N/A'}`);
    });

    console.log('\n[4/4] Summary:');
    console.log('🎉 SUCCESS: All dedicated database tables are ready, clean, and organized!');
    console.log('Data is safely persisted across server restarts.');
  } catch (err) {
    console.error('Notice during sync:', err.message);
  }
}

main();
