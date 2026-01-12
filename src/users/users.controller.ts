import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { AuthGuard } from 'src/auth/auth.guard';
import type { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findAll(@Query() paginationDto: PaginationDto, @Req() request: Request) {
    const role = request.headers.role as string;
    if (role !== 'Admin') {
      throw new ForbiddenException('Only admins can see all users');
    }
    return this.usersService.findAll(paginationDto);
  }

  @UseGuards(AuthGuard)
  @Get(':id/theatres')
  async findUserTheatre(@Param('id') id: string, @Req() request: Request) {
    const role = request.headers.role as string;
    return await this.usersService.findUserTheatre(+id, role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const role = request.headers.role as string;
    if (role !== 'Admin') {
      throw new ForbiddenException('Only admins can see user');
    }
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
