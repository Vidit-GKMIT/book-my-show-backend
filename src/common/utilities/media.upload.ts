import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class S3Service {
  private s3: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    this.bucket = process.env.AWS_S3_BUCKET_NAME!;
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<string> {
    try {
      if (!file?.[0]?.originalname) {
        throw new BadRequestException('file required!');
      }

      const key = `${folder}/${(uuid)}-${file?.[0].originalname}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3.send(command);

      return `https://${this.bucket}.s3.amazonaws.com/${key}`;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('File upload failed');
    }
  }
}
