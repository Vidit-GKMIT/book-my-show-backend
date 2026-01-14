import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { Booking } from './entities/booking.entity';
import { Show } from 'src/shows/entities/show.entity';
import { NotFound } from '@aws-sdk/client-s3';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) {}
  create(createBookingDto: CreateBookingDto) {
    return 'This action adds a new booking';
  }

  async findAll(paginationDto: PaginationDto, id: number) {
    const { limit, page, order } = paginationDto;

    const offset = (page - 1) * limit;
    const sortOrder = order === 1 ? 'ASC' : 'DESC';
    const [users, count] = await this.userRepository.findAndCount({
      relations: {
        bookings: true,
      },
      where: { id },
      take: limit,
      skip: offset,
      order: { createdAt: sortOrder },
    });

    const bookings = users[0].bookings;
    return { bookings, page, limit, totalPages: Math.ceil(count / limit) };
  }

  async cancelBooking(id: number, userId: number) {
    const booking = await this.bookingRepository.find({
      relations: {
        userId: true,
        showId: {
          movieId: true,
          screenId: {
            theatreId: true,
          },
        },
      },
      where: {
        id,
      },
    });

    const bookingUserId = booking[0].userId.id;

    if (userId !== bookingUserId) {
      throw new ForbiddenException('You can not not cancel this booking.');
    }

    const bookedSeats = booking[0].bookedSeats;
    await this.bookingRepository.softDelete(booking[0].id);

    const show = await this.showRepository.findOne({
      where: {
        id: booking[0].showId.id,
      },
    });

    if (show) {
      show.availableSeats += bookedSeats;
      await this.showRepository.save(show);
    } else {
      throw new NotFoundException('Show not found');
    }

    const movie = booking[0].showId.movieId.name;
    const showTime = booking[0].showId.showDateTime;
    const theatreName = booking[0].showId.screenId.theatreId.name;
    const city = booking[0].showId.screenId.theatreId.city;
    return { movie, showTime, theatreName, city };
  }

  findOne(id: number) {
    return `This action returns a #${id} booking`;
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    return `This action updates a #${id} booking`;
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}
