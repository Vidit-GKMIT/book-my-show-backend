import { Module } from '@nestjs/common';
import { TheatresService } from './theatres.service';
import { TheatresController } from './theatres.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Show } from 'src/shows/entities/show.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Theatre } from './entities/theatre.entity';
import { City } from 'src/cities/entities/city.entity';
import { Country } from 'src/countries/entities/country.entity';
import { Screen } from 'src/screens/entities/screen.entity';

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
  controllers: [TheatresController],
  providers: [TheatresService],
})
export class TheatresModule {}
