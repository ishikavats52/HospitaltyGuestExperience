import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';

export const SERVICE_REQUEST_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const HotelService = createDynamoModel('HotelService');
export const ServiceRequest = createDynamoModel('ServiceRequest');
