import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

    return { data, page, limit, totalPages: Math.ceil(count / limit) };
  }

  async findMe(id: number) {
    const user = await this.userRepository.findOne({
      relations: {
        userRoles: {
          role: true,
        },
      },
      where: { id },
    });
    if (!user) {
      throw new UnauthorizedException('User not authorized');
    }
    const extractedUser = {
      fullName: user.fullName,
      email: user.email,
      phoneNo: user.phoneNo,
      role: user.userRoles[0]?.role?.name,
    };

    return extractedUser;
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    return user;
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

    return theatre;
  }
}
