import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';
import { PLAN_CODES, BILLING_CYCLES } from './plans.constants.js';

export { PLAN_CODES, BILLING_CYCLES };
export const SubscriptionPlan = createDynamoModel('SubscriptionPlan');
