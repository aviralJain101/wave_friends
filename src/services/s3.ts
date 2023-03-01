import { Inject, Service } from 'typedi';
import fs from 'fs';
import config from '../loaders/config';
import S3 from 'aws-sdk/clients/s3';

@Service()
export default class S3Service {
  readingsBucket: string;

  constructor(@Inject('s3') private s3: S3) {
    this.readingsBucket = config.buckets.readingsBucket;
  }

  public async uploadFileToBucket(file: Express.Multer.File): Promise<S3.ManagedUpload.SendData> {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
      Bucket: this.readingsBucket,
      Body: fileStream,
      Key: file.filename,
    };

    return this.s3.upload(uploadParams).promise();
  }
}
