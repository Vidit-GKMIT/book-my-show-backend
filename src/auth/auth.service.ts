import {
  Body,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { loginDTO, registerDTO } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { UserRole } from 'src/roles/entities/userRole.entity';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Mail } from 'src/common/utilities/email.utility';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

import * as dotenv from 'dotenv';
import { log } from 'console';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
    private readonly mail: Mail,
    @Inject(CACHE_MANAGER) private cacheService: Cache,
  ) {}

  async register(registerDTO: registerDTO): Promise<void> {
    const roleId = registerDTO.roleId;

    const role = await this.roleRepository.findOne({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException(`Role with ${roleId} doesn't exist`);
    }

    const existingUser = await this.userRepository.find({
      where: [{ email: registerDTO.email }, { phoneNo: registerDTO.phoneNo }],
    });

    if (existingUser.length != 0) {
      throw new ConflictException(
        `User with this email or phone already exist`,
      );
    }

    const user = this.userRepository.create({
      fullName: registerDTO.fullName,
      email: registerDTO.email,
      phoneNo: registerDTO.phoneNo,
    });
    await this.userRepository.save(user);

    const userRoleData = this.userRoleRepository.create({
      user: user,
      role: role,
    });

    await this.userRoleRepository.save(userRoleData);
  }

  async login(loginDTO: loginDTO): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email: loginDTO.email },
    });

    if (!user) {
      throw new NotFoundException(`User with ${loginDTO.email} doesn't exists`);
    }

    const userName = user.fullName;

    const otp = Math.floor(100000 + Math.random() * 900000);
    const message = `Hi ${userName}, your OTP for Book My Show is ${otp}`;
    const subject = `OTP`;
    this.mail.sendMail(message, subject, loginDTO.email);
    await this.cacheService.set(loginDTO.email, otp);
  }

  async verifyOtp(data: { email: string; otp: number }) {
    const otp = data.otp;
    const redisOtp = await this.cacheService.get(data.email);

    if (otp !== redisOtp) {
      throw new UnauthorizedException(`OTP is not correct`);
    }

    const existingUser = await this.userRepository.findOne({
      where: [{ email: data.email }],
    });

    if (!existingUser) {
      throw new NotFoundException(
        `User with email ${data.email} doesn't exists`,
      );
    }

    const accessPayload = {
      id: existingUser.id,
      email: existingUser.email,
      type: 'AccessToken',
    };
    const refreshPayload = {
      id: existingUser.id,
      email: existingUser.email,
      type: 'RefreshToken',
    };
    console.log(process.env.JWT_ACCESS_EXPIRY);
    console.log(typeof process.env.JWT_ACCESS_EXPIRY);
    return {
      accessToken: await this.jwtService.signAsync(accessPayload, {
        expiresIn: '1d',
      }),
      refreshToken: await this.jwtService.signAsync(refreshPayload, {
        expiresIn: '10d',
      }),
    };
  }

  async refresh(authHeader: string) {
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [type, token] = authHeader.split(' ');

    if (!token) {
      throw new UnauthorizedException('Not Authorized');
    }

    const payload: { id: number; email: string; type: string } =
      await this.jwtService.verifyAsync(token);

    if (!payload) {
      throw new UnauthorizedException('Not Authorized');
    }

    const newToken = await this.jwtService.signAsync(
      {
        id: payload.id,
        email: payload.email,
        type: payload.type,
      },
      {
        expiresIn: '30m',
      },
    );

    return newToken;
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
