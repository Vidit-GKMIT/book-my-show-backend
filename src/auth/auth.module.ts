import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Show } from 'src/shows/entities/show.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Screen } from 'src/screens/entities/screen.entity';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { City } from 'src/cities/entities/city.entity';
import { Country } from 'src/countries/entities/country.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { JwtModule } from '@nestjs/jwt';

import * as dotenv from 'dotenv';
import { Mail } from 'src/common/utilities/email.utility';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      UserRole,
      Booking,
      Show,
      Movie,
      Screen,
      Theatre,
      City,
      Country,
    ]),
    JwtModule.register({ secret: process.env.JWT_SECRET, global: true }),
  ],
  controllers: [AuthController],
  providers: [AuthService, Mail],
})
export class AuthModule {}
