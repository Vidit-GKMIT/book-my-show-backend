import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { Booking } from './entities/booking.entity';
import { Show } from 'src/shows/entities/show.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Screen } from 'src/screens/entities/screen.entity';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { City } from 'src/cities/entities/city.entity';
import { Country } from 'src/countries/entities/country.entity';
import { TheatreAttribute } from 'src/theatres/entities/theatre_attributes.entity';

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
      TheatreAttribute,
    ]),
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
