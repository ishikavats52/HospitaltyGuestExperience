import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';

export const MenuCategory = createDynamoModel('MenuCategory');
export const MenuItem = createDynamoModel('MenuItem');
