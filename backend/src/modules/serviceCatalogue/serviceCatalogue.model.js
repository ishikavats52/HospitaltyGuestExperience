import { createDynamoModel } from '../../database/dynamodb/dynamodbModel.js';
import { SERVICE_CATEGORIES, SERVICE_STATUS } from './serviceCatalogue.constants.js';

export { SERVICE_CATEGORIES, SERVICE_STATUS };
export const ServiceCatalogue = createDynamoModel('ServiceCatalogue');
