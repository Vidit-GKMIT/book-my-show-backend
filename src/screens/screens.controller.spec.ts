import { Test, TestingModule } from '@nestjs/testing';
import { ScreensController } from './screens.controller';
import { ScreensService } from './screens.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CanActivate, ExecutionContext } from '@nestjs/common';

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

describe('ScreensController', () => {
  let controller: ScreensController;
  let service: jest.Mocked<ScreensService>;

  const mockScreensService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScreensController],
      providers: [
        {
          provide: ScreensService,
          useValue: mockScreensService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    controller = module.get<ScreensController>(ScreensController);
    service = module.get(ScreensService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a screen', async () => {
    service.create.mockResolvedValue(undefined);

    const dto = {
      name: 'Screen 1',
      seats: 100,
      theatreId: 1,
    };

    const req: any = {
      headers: { id: '10' },
    };

    const result = await controller.create(dto as any, req);

    expect(service.create).toHaveBeenCalledWith(dto, 10);
    expect(result.message).toBe('Screen added successfully');
  });

  it('should return all screens', () => {
    service.findAll.mockReturnValue('This action returns all screens');

    expect(controller.findAll()).toBe('This action returns all screens');
  });

  it('should return one screen', () => {
    service.findOne.mockReturnValue('This action returns a #1 screen');

    expect(controller.findOne('1')).toBe('This action returns a #1 screen');
  });

  it('should update a screen', () => {
    service.update.mockReturnValue('This action updates a #1 screen');

    const result = controller.update('1', {} as any);

    expect(result).toBe('This action updates a #1 screen');
  });

  it('should remove a screen', () => {
    service.remove.mockReturnValue('This action removes a #1 screen');

    const result = controller.remove('1');

    expect(result).toBe('This action removes a #1 screen');
  });
});
