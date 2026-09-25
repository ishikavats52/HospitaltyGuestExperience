import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';
import { LOCATION_TYPES } from './locations.constants.js';

export { LOCATION_TYPES };
export const Location = createDynamoModel('Location');
