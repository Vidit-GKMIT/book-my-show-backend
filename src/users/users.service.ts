import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { Theatre } from 'src/theatres/entities/theatre.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Theatre)
    private readonly theatreRepository: Repository<Theatre>,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll(pagination: PaginationDto) {
    const { page, limit, order } = pagination;

    const skip = (page - 1) * limit;
    const sortOrder = order === 1 ? 'ASC' : 'DESC';

    const [data, count] = await this.userRepository.findAndCount({
      take: limit,
      skip,
      order: {
        createdAt: sortOrder,
      },
    });

    return {
      data,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      message: 'Users fetched successfully',
      status: 200,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    return {
      data: user,
      message: 'User fetched successfully',
      status: 200,
    };
  }

  async findUserTheatre(id: number, role: string) {
    if (role === 'Customer') {
      throw new ForbiddenException('Not authorised to access this resource');
    }
    const theatre = await this.theatreRepository.find({
      where: {
        user: { id },
      },
    });

    return {
      data: theatre,
      message: 'All theatres fetched succesfully',
      status: 200,
    };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
