import { Module } from '@nestjs/common';
import { ShowsService } from './shows.service';
import { ShowsController } from './shows.controller';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Show } from './entities/show.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { City } from 'src/cities/entities/city.entity';
import { Country } from 'src/countries/entities/country.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Screen } from 'src/screens/entities/screen.entity';
import { TheatreAttributes } from 'src/common/utilities/theatreAttributes.utility';
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
  controllers: [ShowsController],
  providers: [ShowsService, TheatreAttributes],
})
export class ShowsModule {}
