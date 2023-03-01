export interface PolicyInput {
  userId: string;
  policies: {
    policyId: string;
    vehicleDetails: {
      regNumber: string;
      type: string;
    };
    initialReading: string;
    activationDate: string;
    expiryDate: string;
    kmsPurchased: number;
  }[];
}
