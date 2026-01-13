import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ShowsService } from './shows.service';
import { CreateShowDto } from './dto/create-show.dto';
import { UpdateShowDto } from './dto/update-show.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request } from 'express';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { CreateBookingDto } from 'src/bookings/dto/create-booking.dto';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('shows')
export class ShowsController {
  constructor(private readonly showsService: ShowsService) {}
  @Roles(Role.ADMIN, Role.THEATRE_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(@Body() createShowDto: CreateShowDto, @Req() request: Request) {
    await this.showsService.create(createShowDto, request);
    return {
      message: 'Show created successfully',
      status: 201,
    };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const { data, page, limit, totalPages } =
      await this.showsService.findAll(paginationDto);
    return {
      data: data,
      pagination: {
        page,
        limit,
        totalPages,
      },
      message: 'All shows fetched successfully',
      status: 200,
    };
  }

  @Roles(Role.ADMIN, Role.CUSTOMER)
  @UseGuards(AuthGuard, RolesGuard)
  @Post(':id/books')
  async bookShow(
    @Body() createBookingDto: CreateBookingDto,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    const userId = request.headers.id as string;
    await this.showsService.bookShow(createBookingDto, +id, +userId);
    return {
      message: 'Booking created successfully for this show',
      status: 201,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.showsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShowDto: UpdateShowDto) {
    return this.showsService.update(+id, updateShowDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: Request) {
    const theatreOwnerId = request.headers.id as string;
    const role = request.headers.role as string;
    if (role === 'Customer') {
      throw new ForbiddenException(`Customers can't delete shows.`);
    }
    await this.showsService.remove(+id, +theatreOwnerId);
    return {
      message: 'Show deleted successfully (soft delete)',
      status: 204,
    };
  }
}
