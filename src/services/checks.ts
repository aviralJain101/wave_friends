import { Service } from '';
import { PolicyModel } from '../interfaces/policyModel';

function dateDiffInDays(lastReadingDateEpoch: number): number {
  let diff = lastReadingDateEpoch - new Date().getTime() / 1000;
  diff /= 60 * 60 * 24;
  return Math.abs(Math.round(diff));
}

@Service()
export default class ChecksService {
  public getLastReadingDate(data: PolicyModel): string {
    if (data.readings.length === 0) {
      return data.activationDate;
    } else {
      const readings = data.readings;
      return readings[readings.length - 1].readingDate;
    }
  }

  public getUploadReadingReminder(data: PolicyModel): boolean {
    const readingUploadReminderThresholdDays = 30;
    const lastReadingDate = this.getLastReadingDate(data);
    const daysDiff = dateDiffInDays(parseInt(lastReadingDate));
    if (daysDiff > readingUploadReminderThresholdDays) {
      return true;
    }
    return false;
  }

  public getRemainingKms(initialReading: string, kmsPurchased: number, latestOdometerReading: string): number {
    return parseInt(initialReading) + kmsPurchased - parseInt(latestOdometerReading);
  }

  public getLatestOdometerReading(data: PolicyModel): string {
    if (data.readings.length === 0) {
      return data.initialReading;
    } else {
      return data.latestOdometerReading;
    }
  }
}
