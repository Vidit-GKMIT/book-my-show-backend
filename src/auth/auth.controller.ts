import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { loginDTO, registerDTO } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Role, Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerAuthDto: registerDTO) {
    await this.authService.register(registerAuthDto);
    return {
      status: 200,
      message: 'User registered successfully',
    };
  }

  @Roles(Role.ADMIN, Role.THEATRE_OWNER, Role.CUSTOMER)
  @UseGuards(AuthGuard, RolesGuard)
  @Get('refresh')
  async refresh(@Headers('authorization') authHeader: string) {
    const accessToken = await this.authService.refresh(authHeader);
    return {
      accessToken,
    };
  }

  @Post('login')
  async login(@Body() loginDTO: loginDTO) {
    await this.authService.login(loginDTO);
    return {
      status: 200,
      message: 'OTP send successfully',
    };
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: { email: string; otp: number }) {
    const tokens = await this.authService.verifyOtp(data);
    return {
      message: 'User logged in successfully',
      status: 200,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
