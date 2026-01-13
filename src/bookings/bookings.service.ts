import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
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
