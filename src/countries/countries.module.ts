import { Module } from '@nestjs/common';
import { CountriesService } from './countries.service';
import { CountriesController } from './countries.controller';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Show } from 'src/shows/entities/show.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Screen } from 'src/screens/entities/screen.entity';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { City } from 'src/cities/entities/city.entity';
import { Country } from './entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

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
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
