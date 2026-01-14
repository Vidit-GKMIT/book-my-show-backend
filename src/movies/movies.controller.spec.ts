import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { S3Service } from 'src/common/utilities/media.upload';

describe('MoviesController', () => {
  let controller: MoviesController;

  const movieRepository = {
    create: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: movieRepository },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
     jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
