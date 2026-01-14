import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
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
    const { name, seats, theatreId } = createScreenDto;

    const theatres = await this.theatreRepository.findOne({
      where: {
        id: theatreId,
      },
      relations: {
        user: true,
      },
    });

    if (!theatres) {
      throw new NotFoundException(
        'No theatre with this id exists, please create a theatre first.',
      );
    }

    if (theatres?.user.id !== id) {
      throw new ForbiddenException(
        'Theatre owner not authorized to add sreen to this theatre',
      );
    }

    const existingScreen = await this.screenRepository.findOne({
      where: {
        name,
        theatreId: { id: theatreId },
      },
    });

    if (existingScreen) {
      throw new ConflictException(
        'Screen with this name already exisits in this theatre. please create a screen with new name',
      );
    }

    const screen = this.screenRepository.create({
      name,
      seats,
      theatreId: theatres,
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
