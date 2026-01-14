import { Test, TestingModule } from '@nestjs/testing';
import { TheatresService } from './theatres.service';

describe('TheatresService', () => {
  let service: TheatresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TheatresService],
    }).compile();

    service = module.get<TheatresService>(TheatresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
