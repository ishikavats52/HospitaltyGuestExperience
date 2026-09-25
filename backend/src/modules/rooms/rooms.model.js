import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';

export const RoomType = createDynamoModel('RoomType');
export const Room = createDynamoModel('Room');
