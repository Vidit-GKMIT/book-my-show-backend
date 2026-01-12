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
  create(@Body() createShowDto: CreateShowDto, @Req() request: Request) {
    const role = request.headers.role as string;
    if (role === 'Customer') {
      throw new ForbiddenException(`Customers can't create shows.`);
    }
    return this.showsService.create(createShowDto, request);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.showsService.findAll(paginationDto);
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
    return await this.showsService.bookShow(createBookingDto, +id, +userId);
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
    return await this.showsService.remove(+id, +theatreOwnerId);
  }
}
