import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';
import { SUBSCRIPTION_STATUS } from './subscriptions.constants.js';

export { SUBSCRIPTION_STATUS };
export const HotelSubscription = createDynamoModel('HotelSubscription');
