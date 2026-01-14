import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export interface healthResponse {
  message: string;
  date: string;
  success: boolean;
}

@Injectable()
export class AppService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}
  async health(): Promise<healthResponse> {
    return {
      message: 'Backend is running...',
      date: (await this.dataSource.query('SELECT CURRENT_TIME'))[0]
        .current_time as string,
      success: true,
    };
  }
}
