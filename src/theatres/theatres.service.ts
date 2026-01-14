import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Theatre } from './entities/theatre.entity';
import { In, Repository } from 'typeorm';
import { City } from 'src/cities/entities/city.entity';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { Screen } from 'src/screens/entities/screen.entity';
import { Show } from 'src/shows/entities/show.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Injectable()
export class TheatresService {
  constructor(
    @InjectRepository(Theatre)
    private readonly theatreRepository: Repository<Theatre>,
    @InjectRepository(City) private readonly cityRepository: Repository<City>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Show) private readonly showRepository: Repository<Show>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @InjectRepository(Screen)
    private readonly screenRepository: Repository<Screen>,
  ) {}
  async create(createTheatreDto: CreateTheatreDto, email: string) {
    const { name, address, city } = createTheatreDto;
    const cityEntity = await this.cityRepository.findOne({
      where: { id: city },
    });

    if (!cityEntity) {
      throw new NotFoundException('City not found');
    }

    const userEntity = await this.userRepository.findOne({
      where: { email },
    });

    if (!userEntity) {
      throw new NotFoundException('User not found');
    }

    const theatre = this.theatreRepository.create({
      name,
      address,
      user: userEntity,
      city: cityEntity,
    });

    await this.theatreRepository.save(theatre);
  }

  async findAllTheatres(
    movie: string | undefined,
    paginationDto: PaginationDto,
  ) {
    const { page, limit, order } = paginationDto;
    const skip = (page - 1) * limit;
    const sortOrder = order === 1 ? 'ASC' : 'DESC';

    // if (!userId)
    const movies = await this.movieRepository.find({
      relations: {
        shows: {
          screenId: {
            theatreId: true,
          },
        },
      },
      where: {
        name: movie,
      },
      take: limit,
      skip,
      order: { createdAt: sortOrder },
    });

    if (movies.length === 0) {
      throw new BadRequestException('These is no movie exsits with this name');
    }

    const uniqueTheatresMap = new Map();

    movies.forEach((movie) => {
      movie.shows.forEach((show) => {
        const theatre = show.screenId.theatreId;

        if (!uniqueTheatresMap.has(theatre.id)) {
          uniqueTheatresMap.set(theatre.id, {
            id: theatre.id,
            name: theatre.name,
            address: theatre.address,
          });
        }
      });
    });

    const uniqueTheatres = Array.from(uniqueTheatresMap.values());
    return uniqueTheatres;
  }

  async findUserTheatres(userId: number, movie: string | undefined) {
    const theatres = await this.theatreRepository.find({
      relations: {
        city: true,
      },
      where: {
        user: { id: userId },
        screens: {
          shows: {
            movieId: { name: movie },
          },
        },
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

  async findAllScreens(
    id: number,
    paginationDto: PaginationDto,
    userId: number,
  ) {
    const theatre = await this.theatreRepository.findOne({
      relations: {
        user: true,
      },
      select: { id: true },
      where: { id },
    });

    if (!theatre) {
      throw new NotFoundException(`There is no theatre with this id`);
    }

    if (theatre.user.id != userId) {
      throw new ForbiddenException(
        'You are not allowed to access this resource as this theatre is not yours',
      );
    }

    const { limit, page, order } = paginationDto;

    const take = limit;
    const skip = (page - 1) * take;

    const [screens, total] = await this.screenRepository.findAndCount({
      where: {
        theatreId: { id },
      },
      take,
      skip,
      order: { createdAt: order },
    });

    return { screens, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: number) {
    return `This action returns a #${id} theatre`;
  }

  update(id: number, updateTheatreDto: UpdateTheatreDto) {
    return `This action updates a #${id} theatre`;
  }

  remove(id: number) {
    return `This action removes a #${id} theatre`;
  }
}
