import { Test, TestingModule } from '@nestjs/testing';
import { TheatresController } from './theatres.controller';
import { TheatresService } from './theatres.service';

describe('TheatresController', () => {
  let controller: TheatresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TheatresController],
      providers: [TheatresService],
    }).compile();

    controller = module.get<TheatresController>(TheatresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
