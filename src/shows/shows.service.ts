import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import {
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Movie } from 'src/movies/entities/movie.entity';
import { TheatreAttributes } from 'src/common/utilities/theatreAttributes.utility';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { Request } from 'express';
import { Screen } from 'src/screens/entities/screen.entity';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { Booking } from 'src/bookings/entities/booking.entity';
import { Mail } from 'src/common/utilities/email.utility';
import { In } from 'typeorm/browser';
import { User } from 'src/users/entities/user.entity';
import { DateService } from 'src/common/utilities/date.utility';
import { City } from 'src/cities/entities/city.entity';

@Injectable()
export class ShowsService {
  constructor(
    @InjectRepository(Show) private readonly showRepository: Repository<Show>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Screen)
    private readonly screenRepository: Repository<Screen>,
    @InjectRepository(Theatre)
    private readonly theatreRepository: Repository<Theatre>,
    private readonly theatreAttribute: TheatreAttributes,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly mail: Mail,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly dateService: DateService,
    @InjectRepository(City) private readonly cityRepository: Repository<City>,
  ) {}

  async create(createShowDto: CreateShowDto, userId: number) {
    const { price, showDateTime, movieId, screenId } = createShowDto;
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId,
      },
    });

    if (!movie) {
      throw new BadRequestException('No movie with this name exists.');
    }

    const screen = await this.screenRepository.findOne({
      where: {
        id: screenId,
      },
    });

    if (!screen) {
      throw new NotFoundException('Screen with this id not found');
    }

    const bufferTime = await this.theatreAttribute.getBufferTime();

    const startDateTime = new Date(showDateTime);
    const endDateTime = new Date(
      startDateTime.getTime() + (movie.duration + bufferTime) * 60 * 1000,
    );

    const prevShow = await this.showRepository.find({
      where: {
        showDateTime: LessThanOrEqual(startDateTime),
        screenId: {
          id: screenId,
        },
      },
      order: { showDateTime: 'DESC' },
      take: 1,
    });

    const nextShow = await this.showRepository.find({
      where: {
        showDateTime: MoreThanOrEqual(startDateTime),
        screenId: {
          id: screenId,
        },
      },
      order: { showDateTime: 'ASC' },
      take: 1,
    });
    const prevShowEndDateTime =
      prevShow.length === 0 ? true : prevShow[0].showEndDateTime;

    const nextShowEndDateTime =
      nextShow.length === 0 ? true : nextShow[0].showDateTime;

    this.dateService.isValidShow(startDateTime);
    const overlapped = this.dateService.isOverLapping(
      startDateTime,
      endDateTime,
      prevShowEndDateTime,
      nextShowEndDateTime,
    );

    if (!overlapped) {
      const theatre = await this.theatreRepository.findOne({
        where: {
          screens: [
            {
              id: screenId,
            },
          ],
        },
        relations: {
          city: true,
          user: true,
          screens: true,
        },
      });

      if (theatre?.user.id !== +userId) {
        throw new ForbiddenException('User unauthorized');
      }

      const show = this.showRepository.create({
        price,
        showDateTime,
        showEndDateTime: endDateTime,
        availableSeats: theatre.screens[0].seats,
        movieId: { id: movieId },
        screenId: { id: screenId },
      });

      await this.showRepository.save(show);
    } else {
      throw new BadRequestException(
        'Can not create a show as there are shows in this slot',
      );
    }
  }

  async findAll(paginationDto: PaginationDto, city: string | undefined) {
    const { page, limit, order } = paginationDto;
    const skip = (page - 1) * limit;
    const sortOrder = order === 1 ? 'ASC' : 'DESC';

    const existingCity = await this.cityRepository.findOne({
      where: {
        name: city,
      },
    });

    if (!existingCity) {
      throw new NotFoundException(`City with name ${city} doesn't exists.`);
    }

    const now = new Date();

    const [shows, count] = await this.showRepository.findAndCount({
      where: {
        showDateTime: MoreThan(now),
        availableSeats: MoreThan(0),
        screenId: {
          theatreId: {
            city: {
              name: city,
            },
          },
        },
      },
      relations: {
        movieId: true,
        screenId: {
          theatreId: {
            city: true,
          },
        },
      },
      skip,
      take: limit,
      order: {
        showDateTime: sortOrder,
      },
    });

    const data = shows.map((show) => ({
      showId: show.id,
      showPrice: show.price,
      showDateTime: show.showDateTime,
      showEndDateTime: show.showEndDateTime,
      availableSeats: show.availableSeats,

      movieName: show.movieId.name,
      moviePoster: show.movieId.poster,
      movieTrailer: show.movieId.trailer,

      theatreName: show.screenId.theatreId.name,
      theatreCity: show.screenId.theatreId.city.name,
    }));

    return { data, page, limit, totalPages: Math.ceil(count / limit) };
  }

  async bookShow(
    createBookingDto: CreateBookingDto,
    id: number,
    userId: number,
  ) {
    const showId = id;
    const bookingSeats = createBookingDto.bookedSeats;

    const show = await this.showRepository.findOne({
      where: {
        id: showId,
      },
    });

    if (!show) {
      throw new BadRequestException(`No show with id ${id} exists.`);
    }

    const now = new Date();
    const startDateTime = show.showDateTime;
    if (startDateTime.getTime() < now.getTime()) {
      throw new BadRequestException('You can not book previous shows.');
    }

    if (startDateTime.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('You can book shows only in 7 days range');
    }
    const availableSeats = show.availableSeats;

    if (availableSeats < bookingSeats) {
      throw new BadRequestException(
        `Only ${availableSeats} seats left for this show`,
      );
    }

    const totalPrice = bookingSeats * show.price;

    const booking = this.bookingRepository.create({
      bookedSeats: bookingSeats,
      totalPrice,
      userId: { id: userId },
      showId: { id: show.id },
    });

    await this.bookingRepository.save(booking);

    await this.showRepository.update(
      { id: show.id },
      { availableSeats: availableSeats - bookingSeats },
    );

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    const message = `Hi, ${user?.fullName} your ${bookingSeats} have been successfully booked. Enjoy your show...!!`;
    const subject = `Tickets Confirmed`;
    this.mail.sendMail(message, subject, user?.email);
  }

  async cancelledTickets(id: number, userId: number) {
    console.log(id);
    const shows = await this.showRepository.findOne({
      relations: {
        screenId: {
          theatreId: {
            user: true,
          },
        },
        bookings: true,
      },
      where: {
        id,
      },
    });

    if (!shows) {
      throw new NotFoundException(`Show with this id doesn't exists.`);
    }

    console.log(userId);
    console.log(shows?.screenId.theatreId.user.id);

    console.log(typeof userId);
    console.log(typeof shows?.screenId.theatreId.user.id);

    if (shows?.screenId.theatreId.user.id !== userId) {
      throw new ForbiddenException('Not allowed to access this resource');
    }

    console.log(shows);

    const cancelledData = await this.bookingRepository.find({
      relations: {
        userId: true,
      },
      where: {
        showId: { id: shows.id },
        deletedAt: Not(IsNull()),
      },
      withDeleted: true,
    });
    return cancelledData;
  }

  findOne(id: number) {
    return `This action returns a #${id} show`;
  }

  update(id: number, updateShowDto: UpdateShowDto) {
    return `This action updates a #${id} show`;
  }

  async remove(id: number, theatreOwnerId: number) {
    const shows = await this.showRepository.findOne({
      relations: {
        screenId: {
          theatreId: {
            user: true,
          },
        },
        bookings: true,
      },
      where: {
        id,
      },
    });

    if (!shows) {
      throw new NotFoundException('There is no with this id');
    }

    console.log(id);
    console.log(shows);

    if (shows.screenId.theatreId.user.id !== theatreOwnerId) {
      throw new ForbiddenException(
        'You are not authorized to delete this show',
      );
    }

    const showStartTime = new Date(shows.showDateTime);
    const now = new Date();

    if (showStartTime.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'You can not delete a show which is less than 7 days near',
      );
    }

    await this.showRepository.softDelete(shows.id);
  }
}
