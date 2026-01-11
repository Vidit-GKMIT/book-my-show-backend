import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateScreenDto } from './dto/create-screen.dto';
import { UpdateScreenDto } from './dto/update-screen.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Screen } from './entities/screen.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Theatre } from 'src/theatres/entities/theatre.entity';
import { NotFoundError } from 'rxjs';

@Injectable()
export class ScreensService {
  constructor(
    @InjectRepository(Screen)
    private readonly screenRepository: Repository<Screen>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Theatre)
    private readonly theatreRepository: Repository<Theatre>,
  ) {}
  async create(createScreenDto: CreateScreenDto, id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not authorised');
    }

    const theatre = await this.theatreRepository.findOne({
      where: {
        user: {
          id: user.id,
        },
      },
    });

    if (!theatre) {
      throw new BadRequestException('Please create a theatre first.');
    }

    const { name, seats } = createScreenDto;
    const screen = this.screenRepository.create({
      name,
      seats,
      theatreId: theatre,
    });

    await this.screenRepository.save(screen);
  }

  findAll() {
    return `This action returns all screens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} screen`;
  }

  update(id: number, updateScreenDto: UpdateScreenDto) {
    return `This action updates a #${id} screen`;
  }

  remove(id: number) {
    return `This action removes a #${id} screen`;
  }
}
