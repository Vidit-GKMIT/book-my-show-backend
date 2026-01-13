import 'reflect-metadata'; //Without reflect-metadata, TypeORM cannot understand entities.
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config();

// Base options shared by Nest & CLI
// A common database configuration shared by:
// NestJS runtime
// TypeORM CLI

const baseOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
};

// TypeORM CLI (migrations) - It needs DataSource for to run, genetate migrations and path of dist folder is given
// TypeORM CLI runs on compiled JS

export const dataSource = new DataSource({
  ...baseOptions,
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
});

// NestJS runtime
// Runs when NestJS app starts

export const typeOrmConfig: TypeOrmModuleOptions = {
  ...baseOptions,
  autoLoadEntities: true,
};
