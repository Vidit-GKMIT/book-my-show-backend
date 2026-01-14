import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request } from 'express';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const { data, page, limit, totalPages } =
      await this.usersService.findAll(paginationDto);
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages,
      },
      message: 'Users fetched successfully',
      status: 200,
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async findMe(@Req() request: Request) {
    const id = request.headers.id as string;
    const extractedUser = await this.usersService.findMe(+id);
    return {
      data: extractedUser,
      message: 'Your details fetched successfully',
      status: 200,
    };
  }

  @Roles(Role.ADMIN, Role.THEATRE_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id/theatres')
  async findUserTheatre(@Param('id') id: string, @Req() request: Request) {
    const userId = request.headers.id as string;
    const role = request.headers.role as string;
    const theatre = await this.usersService.findUserTheatre(+id, +userId, role);
    return {
      data: theatre,
      message: 'All theatres of this user fetched succesfully',
      status: 200,
    };
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(+id);
    return {
      data,
      message: 'User fetched successfully',
      status: 200,
    };
  }
}
