import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from '../ormconfig';
import { MoviesModule } from './movies/movies.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { ShowsModule } from './shows/shows.module';
import { TheatresModule } from './theatres/theatres.module';
import { CitiesModule } from './cities/cities.module';
import { CountriesModule } from './countries/countries.module';
import { ScreensModule } from './screens/screens.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    CacheModule.register({
      isGlobal: true,
      ttl: process.env.CACHE_TTL as undefined,
    }),
    MoviesModule,
    UsersModule,
    RolesModule,
    ShowsModule,
    TheatresModule,
    CitiesModule,
    CountriesModule,
    ScreensModule,
    BookingsModule,
    AuthModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
