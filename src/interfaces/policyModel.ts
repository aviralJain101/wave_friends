import { Reading } from './reading';

export interface PolicyModel {
  userId: string;
  policyId: string;
  vehicleDetails: {
    regNumber: string;
    type: string;
  };
  initialReading: string;
  activationDate: string;
  expiryDate: string;
  kmsPurchased: number; //current value + last top up recharge km
  latestOdometerReading: string;
  readings: Reading[];
}
