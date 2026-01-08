// import { TypeOrmModuleOptions } from '@nestjs/typeorm';
// import * as dotenv from 'dotenv';
// dotenv.config();

// export const config: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: process.env.DB_HOST,
//   port: 5432,
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_DATABASE,
//   synchronize: false,
//   autoLoadEntities: true,
// };


import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

dotenv.config();

/**
 * Base options shared by Nest & CLI
 */
const baseOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
};

/**
 * TypeORM CLI (migrations)
 */
export const dataSource = new DataSource({
  ...baseOptions,
  entities: ['dist/src/**/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
});

/**
 * NestJS runtime
 */
export const typeOrmConfig: TypeOrmModuleOptions = {
  ...baseOptions,
  autoLoadEntities: true,
};
