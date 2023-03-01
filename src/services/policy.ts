/* eslint-disable prettier/prettier */
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { Inject, Service } from 'typedi';
import { PolicyModel } from '../interfaces/policyModel';
import config from '../loaders/config';
import logger from '../loaders/logger';
import errors from '../utils/errors';
import { PolicyInput } from '../interfaces/policyInput';
import { v4 as uuid } from 'uuid';
import { Reading } from '../interfaces/reading';

@Service()
export default class PolicyService {
  policyTableName: string;

  // Inject environment-specific DynamoDB client
  constructor(@Inject('db') private db: DocumentClient) {
    this.policyTableName = config.tables.policies;
  }

  public async createOrUpdatePolicy(policies: PolicyInput): Promise<PolicyModel[]> {
    logger.debug(`Creating / updating policy data for: ${policies.userId}`);

    const updatedPolicies: PolicyModel[] = [];

    for (let i = 0; i < policies.policies.length; i++) {
      const policy = policies.policies[i];

      const epochActivationDate = new Date(policy.activationDate).valueOf() / 1000;
      const epochExpiryDate = new Date(policy.expiryDate).valueOf() / 1000;

      const updatedPolicy: PolicyModel = {
        userId: policies.userId,
        policyId: policy.policyId,
        activationDate: epochActivationDate.toString(),
        expiryDate: epochExpiryDate.toString(),
        initialReading: policy.initialReading,
        kmsPurchased: policy.kmsPurchased,
        vehicleDetails: policy.vehicleDetails,
        readings: [],
        latestOdometerReading: policy.initialReading,
      };

      const key = { userId: policies.userId, policyId: policy.policyId };

      const getParams: DocumentClient.GetItemInput = { TableName: this.policyTableName, Key: key };
      const { Item } = await this.db.get(getParams).promise();
      if (Item) {
        updatedPolicy.readings = Item.readings;
        updatedPolicy.latestOdometerReading = Item.latestOdometerReading;
      }

      const putParams = {
        TableName: this.policyTableName,
        Item: updatedPolicy,
      };

      const putItem = await this.db.put(putParams).promise();
      if (putItem.$response.error) {
        throw new errors.BadRequestError(`Unable to put item in DB ${putItem.$response.error.message}`);
      }
      updatedPolicies.push(updatedPolicy);
    }
    return updatedPolicies;
  }

  public async addReading(
    userId: string,
    policyId: string,
    readingValue: string,
    photoUrl: string,
  ): Promise<PolicyModel> {
    const key = { userId: userId, policyId: policyId };

    const reading: Reading = {
      readingId: uuid(),
      photoUrl: photoUrl,
      readingValue: readingValue,
      readingDate: (new Date().valueOf() / 1000).toString(),
    };

    const params = {
      TableName: this.policyTableName,
      Key: key,
      UpdateExpression: 'SET #rs = list_append(#rs, :vals), latestOdometerReading = :lor',
      ConditionExpression: 'attribute_exists(policyId)',
      ExpressionAttributeNames: {
        '#rs': 'readings',
      },
      ExpressionAttributeValues: {
        ':vals': [reading],
        ':lor': readingValue,
      },
      ReturnValues: 'ALL_NEW',
    };

    //will create a new  item if the item with primary key is not present
    const Item = await this.db.update(params).promise();

    if (Item.$response.error) {
      throw new errors.BadRequestError('Error while adding reading');
    }

    const data = Item.Attributes;
    if (!data) {
      throw new errors.BadRequestError('Unable to add reading');
    }
    const updatedPolicy = data as PolicyModel;

    return updatedPolicy;
  }

  public async getReadingHistory(userId: string, policyId: string): Promise<Reading[]> {
    const key = { userId: userId, policyId: policyId };
    const params: DocumentClient.GetItemInput = { TableName: this.policyTableName, Key: key };
    const { Item } = await this.db.get(params).promise();

    if (Item) {
      if (Item.readings.length === 0) {
        return [] as Reading[];
      }
      return Item.readings as Reading[];
    } else {
      throw new errors.NotFoundError('No such policy exist');
    }
  }

  public async checkIfPolicyExists(userId: string, policyId: string): Promise<void> {
    const key = { userId: userId, policyId: policyId };
    const params: DocumentClient.GetItemInput = { TableName: this.policyTableName, Key: key };
    const { Item } = await this.db.get(params).promise();
    if (!Item) {
      throw new errors.BadRequestError('No such policy exist');
    }
  }
}
