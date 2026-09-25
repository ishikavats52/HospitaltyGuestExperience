import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const FoodOrder = createDynamoModel('FoodOrder');
