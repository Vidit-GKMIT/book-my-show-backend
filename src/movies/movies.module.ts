import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Show } from 'src/shows/entities/show.entity';
import { Movie } from './entities/movie.entity';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { City } from 'src/cities/entities/city.entity';
import { Country } from 'src/countries/entities/country.entity';
import { Screen } from 'src/screens/entities/screen.entity';
import { S3Service } from 'src/common/utilities/media.upload';

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
  controllers: [MoviesController],
  providers: [MoviesService, S3Service],
})
export class MoviesModule {}
