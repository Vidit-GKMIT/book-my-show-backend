import { Injectable } from '@nestjs/common';
import { dataSource } from 'ormconfig';
import { RedisService } from '@nestjs-labs/nestjs-redis';

export interface healthResponse {
  message: string;
  date: Date;
  success: boolean;
  redis: any;
}

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}
  async health(): Promise<healthResponse> {
    const client = await this.redisService.getClient();
    await client.set('redis', 'Redis is connected...');
    return {
      message: 'Backend is running...',
      date: await dataSource.query('SELECT CURRENT_TIME'),
      success: true,
      redis: await client.get('redis'),
    };
  }
}
