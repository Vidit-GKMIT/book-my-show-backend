import { Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { S3Service } from 'src/common/utilities/media.upload';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly s3Service: S3Service,
  ) {}
  async create(
    createMovieDto: CreateMovieDto,
    poster: Express.Multer.File,
    trailer: Express.Multer.File,
  ) {
    const { name, duration } = createMovieDto;

    const posterUrl = await this.s3Service.uploadFile(poster, 'posters');
    const trailerUrl = await this.s3Service.uploadFile(trailer, 'trailers');

    const movie = this.movieRepository.create({
      name,
      duration,
      poster: posterUrl,
      trailer: trailerUrl,
    });

    await this.movieRepository.save(movie);
  }

  async findAll(city: string | undefined, pagination: PaginationDto) {
    const { page, limit, order } = pagination;
    const skip = (page - 1) * limit;

    if (!city) {
      const [movies, total] = await this.movieRepository.findAndCount({
        take: limit,
        skip,
        order: { createdAt: order },
      });
      return {
        data: movies,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Data fetched succesfully',
        status: 200,
      };
    } else {
      const [movies, total] = await this.movieRepository.findAndCount({
        relations: {
          shows: {
            screenId: {
              theatreId: {
                city: true,
              },
            },
          },
        },

        where: {
          shows: {
            screenId: {
              theatreId: {
                city: {
                  id: Number(city),
                },
              },
            },
          },
        },

        order: {
          createdAt: order,
        },

        take: limit,
        skip,
      });

      const transformedData = movies.map((movie) => ({
        movie: movie.name,
        duration: movie.duration,
        poster: movie.poster,
        trailer: movie.trailer,
      }));

      return {
        data: transformedData,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        message: 'Data fetched successfully',
        status: 200,
      };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} movie`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
