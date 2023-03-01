export interface UpdatedPolicyResponse {
  policyId: string;
  showTopUpReminder: boolean;
  remainingKms: number;
  showUploadReadingReminder: boolean;
  latestOdometerReading: string;
}
