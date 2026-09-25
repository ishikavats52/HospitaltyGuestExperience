import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';
import { GUEST_JOURNEY_STATES } from './stays.constants.js';

export { GUEST_JOURNEY_STATES };
export const Stay = createDynamoModel('Stay');
