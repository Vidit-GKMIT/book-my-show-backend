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
      id: user.id,
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

  async findUserTheatre(id: number, userId: number, role: string) {
    if (userId !== id && role === 'Theatre Owner') {
      throw new ForbiddenException('You can not access these theatre details');
    }
    const theatres = await this.theatreRepository.find({
      relations: {
        city: true,
      },
      where: {
        user: { id },
      },
    });

    const formattedTheatre = theatres.map((theatre) => {
      return {
        id: theatre.id,
        name: theatre.name,
        address: theatre.address,
        city: theatre.city.name,
      };
    });

    return formattedTheatre;
  }
}
