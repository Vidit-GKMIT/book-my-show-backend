import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { S3Service } from 'src/common/utilities/media.upload';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockMovieRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockS3Service = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    jest.clearAllMocks();
  });

  describe('create()', () => {
    it('should upload files and save movie', async () => {
      mockS3Service.uploadFile
        .mockResolvedValueOnce('poster-url')
        .mockResolvedValueOnce('trailer-url');

      mockMovieRepository.create.mockReturnValue({
        name: 'Inception',
        duration: 120,
        poster: 'poster-url',
        trailer: 'trailer-url',
      });

      await service.create(
        { name: 'Inception', duration: 120 },
        {} as Express.Multer.File,
        {} as Express.Multer.File,
      );

      expect(mockS3Service.uploadFile).toHaveBeenCalledTimes(2);
      expect(mockMovieRepository.create).toHaveBeenCalled();
      expect(mockMovieRepository.save).toHaveBeenCalled();
    });
  });

  describe('findAll() - without city', () => {
    it('should return paginated movies', async () => {
      mockMovieRepository.findAndCount.mockResolvedValue([
        [{ id: 1, name: 'Movie 1' }],
        1,
      ]);

      const result = await service.findAll(undefined, {
        page: 1,
        limit: 10,
        order: 1,
      });

      expect(mockMovieRepository.findAndCount).toHaveBeenCalled();
      expect(result.data.length).toBe(1);
      expect(result.totalPages).toBe(1);
    });
  });

  describe('findAll() - with city', () => {
    it('should return transformed movie data', async () => {
      mockMovieRepository.findAndCount.mockResolvedValue([
        [
          {
            name: 'Interstellar',
            duration: 169,
            poster: 'poster-url',
            trailer: 'trailer-url',
          },
        ],
        1,
      ]);

      const result = await service.findAll('1', {
        page: 1,
        limit: 10,
        order: 1,
      });

      expect(mockMovieRepository.findAndCount).toHaveBeenCalled();
      expect(result.data[0]).toEqual({
        movie: 'Interstellar',
        duration: 169,
        poster: 'poster-url',
        trailer: 'trailer-url',
      });
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
