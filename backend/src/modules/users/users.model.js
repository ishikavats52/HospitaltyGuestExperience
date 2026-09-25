import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';

export const USER_ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HOTEL_ADMIN: 'HOTEL_ADMIN',
  RECEPTION: 'RECEPTION',
  KITCHEN: 'KITCHEN',
  HOUSEKEEPING: 'HOUSEKEEPING',
  ACCOUNTS: 'ACCOUNTS',
};

export const User = createDynamoModel('User');
