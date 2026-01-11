import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from './entities/show.entity';
import { Repository } from 'typeorm';
import { Movie } from 'src/movies/entities/movie.entity';
import { TheatreAttributes } from 'src/common/utilities/theatreAttributes.utility';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { Request } from 'express';
import { Screen } from 'src/screens/entities/screen.entity';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { Booking } from 'src/bookings/entities/booking.entity';

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
  ) {}

  async create(createShowDto: CreateShowDto, request: Request) {
    const { price, showDateTime, movieId, screenId } = createShowDto;
    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId,
      },
    });

    if (!movie) {
      throw new Error('No movie with this name exists.');
    }

    const bufferTime = 30;
    const startDateTime = new Date(showDateTime);
    const now = new Date();

    if (startDateTime.getTime() - now.getTime() < 10 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'Show must be scheduled at least 10 days in advance',
      );
    }

    const hour = startDateTime.getHours();

    if (hour >= 0 && hour < 8) {
      throw new BadRequestException(
        'Shows cannot be scheduled between 12:00 AM and 8:00 AM',
      );
    }

    const endDateTime = new Date(
      startDateTime.getTime() + (movie.duration + bufferTime) * 60 * 1000,
    );

    const userId = request.headers.id;

    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

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

    return {
      message: 'Show created successfully',
      status: 201,
    };
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, order } = paginationDto;
    const skip = (page - 1) * limit;
    const sortOrder = order === 1 ? 'ASC' : 'DESC';

    const [shows, count] = await this.showRepository.findAndCount({
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
        createdAt: sortOrder,
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

    return {
      data: data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      message: 'All shows fetched successfully',
      status: 200,
    };
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

    console.log(show);

    const now = new Date();
    const startDateTime = show.showDateTime;
    if (startDateTime.getTime() < now.getTime()) {
      throw new BadRequestException('You can not book previous shows.');
    }

    if (startDateTime.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException('You can book shows only in 7 days range');
    }
    console.log(startDateTime.getTime());
    console.log(now.getTime());
    console.log(startDateTime.getTime() - now.getTime());
    console.log(7 * 24 * 60 * 60 * 1000);
    const availableSeats = show.availableSeats;

    if (availableSeats < bookingSeats) {
      throw new BadRequestException(
        `Only ${availableSeats} seats left for this show`,
      );
    }

    // console.log(startDateTime.getTime());
    // console.log(now.getTime());
    // console.log(startDateTime.getTime() - now.getTime());
    // console.log(7 * 24 * 60 * 60 * 1000);

    const totalPrice = bookingSeats * show.price;
    console.log(totalPrice);
    console.log(typeof totalPrice);

    const booking = this.bookingRepository.create({
      bookedSeats: bookingSeats,
      totalPrice,
      userId: { id: userId },
      showId: { id: show.id },
    });

    await this.bookingRepository.save(booking);

    // const updatedShow = this.showRepository.create({
    //   availableSeats: availableSeats - bookingSeats,
    //   price: show.price
    // });
    // await this.showRepository.save(updatedShow);

    await this.showRepository.update(
      { id: show.id },
      { availableSeats: availableSeats - bookingSeats },
    );

    

    return {
      message: 'Booking created successfully for this show',
      status: 201,
    };
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
        screenId: {
          theatreId: {
            user: {
              id: theatreOwnerId,
            },
          },
        },
      },
    });

    if (!shows) {
      throw new ForbiddenException('This show doesnt belongs to you');
    }

    const showStartTime = new Date(shows.showDateTime);
    const now = new Date();

    if (showStartTime.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'You can not delete a show which is less than 7 days near',
      );
    }

    if (shows.showDateTime) console.log(shows);
    console.log(shows?.screenId.theatreId.user.id);
    console.log(theatreOwnerId);

    await this.showRepository.softDelete(shows.id);
    return {
      message: 'Show deleted successfully (soft delete)',
      status: 200,
    };
  }
}
