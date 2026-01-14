import { Test, TestingModule } from '@nestjs/testing';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

/* ---------------- Mock Guards ---------------- */

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

class MockRolesGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    return true;
  }
}

describe('ShowsController', () => {
  let controller: ShowsController;
  let service: jest.Mocked<ShowsService>;

  const mockShowsService: jest.Mocked<ShowsService> = {
    create: jest.fn(),
    findAll: jest.fn(),
    bookShow: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShowsController],
      providers: [
        {
          provide: ShowsService,
          useValue: mockShowsService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useClass(MockAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(MockRolesGuard)
      .compile();

    controller = module.get<ShowsController>(ShowsController);
    service = module.get(ShowsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a show', async () => {
    service.create.mockResolvedValue({
      message: 'Show created successfully',
      status: 201,
    });

    const dto = {
      price: 200,
      showDateTime: new Date(),
      movieId: 1,
      screenId: 2,
    };

    const req: any = {
      headers: {
        role: 'ADMIN',
        id: '10',
      },
    };

    const result = await controller.create(dto as any, req);

    expect(service.create).toHaveBeenCalledWith(dto, req);
    expect(result.status).toBe(201);
  });

  it('should return paginated shows', async () => {
    service.findAll.mockResolvedValue({
      data: [{ showId: 1 }],
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const result = await controller.findAll({
      page: 1,
      limit: 10,
      order: 1,
    });

    expect(result.data.length).toBe(1);
    expect(result.message).toBe('All shows fetched successfully');
    expect(result.status).toBe(200);
  });

  it('should book a show', async () => {
    service.bookShow.mockResolvedValue(undefined);

    const dto = {
      bookedSeats: 2,
    };

    const req: any = {
      headers: {
        id: '5',
      },
    };

    const result = await controller.bookShow(dto as any, '10', req);

    expect(service.bookShow).toHaveBeenCalledWith(dto, 10, 5);
    expect(result.status).toBe(201);
  });

  it('should return a show by id', () => {
    service.findOne.mockReturnValue('This action returns a #1 show');

    const result = controller.findOne('1');

    expect(result).toBe('This action returns a #1 show');
  });

  it('should update a show', () => {
    service.update.mockReturnValue('This action updates a #1 show');

    const result = controller.update('1', {} as any);

    expect(result).toBe('This action updates a #1 show');
  });

  it('should delete a show', async () => {
    service.remove.mockResolvedValue(undefined);

    const req: any = {
      headers: {
        id: '10',
        role: 'ADMIN',
      },
    };

    const result = await controller.remove('1', req);

    expect(service.remove).toHaveBeenCalledWith(1, 10);
    expect(result.status).toBe(204);
  });

  it('should throw ForbiddenException if customer tries to delete show', async () => {
    const req: any = {
      headers: {
        id: '10',
        role: 'Customer',
      },
    };

    await expect(controller.remove('1', req)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
