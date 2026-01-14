import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Mail } from 'src/common/utilities/email.utility';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRoleRepository = {
    findOne: jest.fn(),
  };

  const mockUserRoleRepository = {
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

  const mockCacheService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: getRepositoryToken(Role), useValue: mockRoleRepository },
        {
          provide: getRepositoryToken(UserRole),
          useValue: mockUserRoleRepository,
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: Mail, useValue: mockMailService },
        { provide: CACHE_MANAGER, useValue: mockCacheService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  describe('register()', () => {
    it('should register user successfully', async () => {
      mockRoleRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.find.mockResolvedValue([]);
      mockUserRepository.create.mockReturnValue({ id: 10 });
      mockUserRoleRepository.create.mockReturnValue({});

      await service.register({
        fullName: 'Vidit',
        email: 'vidit@test.com',
        phoneNo: '9999999999',
        roleId: 1,
      });

      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockUserRoleRepository.save).toHaveBeenCalled();
    });

    it('should throw error if role not found', async () => {
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.register({
          fullName: 'Vidit',
          email: 'vidit@test.com',
          phoneNo: '9999999999',
          roleId: 99,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw conflict if user already exists', async () => {
      mockRoleRepository.findOne.mockResolvedValue({ id: 1 });
      mockUserRepository.find.mockResolvedValue([{}]);

      await expect(
        service.register({
          fullName: 'Vidit',
          email: 'vidit@test.com',
          phoneNo: '9999999999',
          roleId: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login()', () => {
    it('should send OTP and store it in cache', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        fullName: 'Vidit',
        email: 'vidit@test.com',
      });

      await service.login({ email: 'vidit@test.com' });

      expect(mockMailService.sendMail).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalled();
    });

    it('should throw error if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'invalid@test.com' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyOtp()', () => {
    it('should verify OTP and return tokens', async () => {
      mockCacheService.get.mockResolvedValue(123456);
      mockUserRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'vidit@test.com',
      });
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.verifyOtp({
        email: 'vidit@test.com',
        otp: 123456,
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error if OTP is invalid', async () => {
      mockCacheService.get.mockResolvedValue(111111);

      await expect(
        service.verifyOtp({ email: 'vidit@test.com', otp: 222222 }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh()', () => {
    it('should issue new token', async () => {
      mockJwtService.verifyAsync.mockResolvedValue({
        id: 1,
        email: 'vidit@test.com',
        type: 'RefreshToken',
      });
      mockJwtService.signAsync.mockResolvedValue('new-token');

      const token = await service.refresh('Bearer oldtoken');

      expect(token).toBe('new-token');
    });

    it('should throw error if auth header missing', async () => {
      await expect(service.refresh('')).rejects.toThrow(UnauthorizedException);
    });
  });
});
