import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Req() request: Request,
  ) {
    const id = request.headers.id as string;
    const { bookings, page, limit, totalPages } =
      await this.bookingsService.findAll(paginationDto, +id);
    return {
      data: bookings,
      pagination: {
        page,
        limit,
        totalPages,
      },
      message: 'All bookings of this user fetched successfully',
      status: 200,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(+id, updateBookingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(+id);
  }
}
