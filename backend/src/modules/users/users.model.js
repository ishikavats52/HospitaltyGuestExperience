import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOTEL_ADMIN: 'HOTEL_ADMIN',
  RECEPTION: 'RECEPTION',
  BOOKING_DESK: 'BOOKING_DESK',
  KITCHEN: 'KITCHEN',
  HOUSEKEEPING: 'HOUSEKEEPING',
  ACCOUNTS: 'ACCOUNTS',
};

export const User = createDynamoModel('User');
