// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';

// describe('UsersController', () => {
//   let controller: UsersController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [UsersService],
//     }).compile();

//     controller = module.get<UsersController>(UsersController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });

import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const mockUsersService = {
    findAll: jest.fn(),
    findMe: jest.fn(),
    findOne: jest.fn(),
    findUserTheatre: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* ---------------- findAll ---------------- */

  it('should return users with pagination', async () => {
    service.findAll.mockResolvedValue({
      data: [{ id: 1 }],
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
    expect(result.message).toBe('Users fetched successfully');
  });


  it('should return logged-in user details', async () => {
    service.findMe.mockResolvedValue({
      fullName: 'Vidit',
      email: 'vidit@test.com',
      phoneNo: '9999999999',
      role: 'ADMIN',
    });

    const req: any = {
      headers: { roleId: '1' },
    };

    const result = await controller.findMe(req);

    expect(service.findMe).toHaveBeenCalledWith(1);
    expect(result.status).toBe(200);
  });

  it('should return theatres of user', async () => {
    service.findUserTheatre.mockResolvedValue([{ id: 1 }]);

    const req: any = {
      headers: { role: 'ADMIN' },
    };

    const result = await controller.findUserTheatre('1', req);

    expect(service.findUserTheatre).toHaveBeenCalledWith(1, 'ADMIN');
    expect(result.data.length).toBe(1);
  });
});
