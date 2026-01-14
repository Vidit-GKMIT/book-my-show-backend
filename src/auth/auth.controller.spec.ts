import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { JwtService } from '@nestjs/jwt';
import { Mail } from 'src/common/utilities/email.utility';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('AuthService', () => {
  let service: AuthService;

  let userRepo: typeof mockUserRepo;
  let roleRepo: typeof mockRoleRepo;
  let userRoleRepo: typeof mockUserRoleRepo;

  const mockUserRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepo = {
    findOne: jest.fn(),
  };

  const mockUserRoleRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  const mockMailService = {
    sendMail: jest.fn(),
  };

  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepo },
        { provide: getRepositoryToken(UserRole), useValue: mockUserRoleRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: Mail, useValue: mockMailService },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
    userRoleRepo = module.get(getRepositoryToken(UserRole));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register user successfully', async () => {
    const dto = {
      fullName: 'Vidit Owner',
      email: 'test@mail.com',
      phoneNo: '9233565966',
      roleId: 1,
    };

    roleRepo.findOne.mockResolvedValue({ id: 1 } as Role);
    userRepo.find.mockResolvedValue([]);
    userRepo.create.mockReturnValue({ id: 10 } as User);
    userRepo.save.mockResolvedValue({ id: 10 } as User);
    userRoleRepo.create.mockReturnValue({} as UserRole);
    userRoleRepo.save.mockResolvedValue({} as UserRole);

    await expect(service.register(dto)).resolves.toBeUndefined();

    expect(roleRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(userRepo.find).toHaveBeenCalled();
    expect(userRepo.create).toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
    expect(userRoleRepo.create).toHaveBeenCalled();
    expect(userRoleRepo.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if role does not exist', async () => {
    const dto = {
      fullName: 'Vidit Owner',
      email: 'test@mail.com',
      phoneNo: '9234565966',
      roleId: 99,
    };

    roleRepo.findOne.mockResolvedValue(null);

    await expect(service.register(dto)).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException if user already exists', async () => {
    const dto = {
      fullName: 'Vidit Owner',
      email: 'test@mail.com',
      phoneNo: '9234565966',
      roleId: 1,
    };

    roleRepo.findOne.mockResolvedValue({ id: 1 } as Role);
    userRepo.find.mockResolvedValue([{ id: 1 }] as User[]);

    await expect(service.register(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw NotFoundException if user does not exist during login', async () => {
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'notfound@mail.com',
      }),
    ).rejects.toThrow(NotFoundException);

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'notfound@mail.com' },
    });
  });

  it('should send OTP and store it in cache on successful login', async () => {
    const user = {
      id: 1,
      fullName: 'Vidit Owner',
      email: 'test@mail.com',
    };

    userRepo.findOne.mockResolvedValue(user as User);
    mockMailService.sendMail.mockResolvedValue(undefined);
    mockCache.set.mockResolvedValue(undefined);

    await expect(
      service.login({ email: 'test@mail.com' }),
    ).resolves.toBeUndefined();

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where: { email: 'test@mail.com' },
    });

    expect(mockMailService.sendMail).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalledWith(
      'test@mail.com',
      expect.any(Number), // OTP
    );
  });
});
