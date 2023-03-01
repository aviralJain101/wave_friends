import { Inject, Service } from 'typedi';
import AWS from 'aws-sdk';
import config from '../loaders/config';
import errors from '../utils/errors';

@Service()
export default class SesService {
  sourceEmail: string;
  destinationEmail: string;
  constructor(@Inject('ses') private ses: AWS.SES) {
    this.sourceEmail = config.aws_ses.sourceEmail;
    this.destinationEmail = config.aws_ses.destinationEmail;
  }

  public async sendEmail(userId: string, policyId: string, topUpKms: number): Promise<void> {
    //TODO: Actual email body and subject needs to be discussed with motor team
    const params = {
      Source: this.sourceEmail,
      Destination: {
        ToAddresses: [this.destinationEmail],
      },
      ReplyToAddresses: [this.sourceEmail],
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<h2>User Id: ${userId}</h2><h2>policy Id: ${policyId}</h2><h2>Recharge kms: ${topUpKms}</h2>`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'REQUEST FOR TOP UP RECHARGE',
        },
      },
    };

    const sendEmailResponse = await this.ses.sendEmail(params).promise();
    if (sendEmailResponse.$response.error) {
      throw new errors.BadRequestError('Error in sending mail');
    }
  }
}
