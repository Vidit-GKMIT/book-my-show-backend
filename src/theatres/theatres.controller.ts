import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { TheatresService } from './theatres.service';
import { CreateTheatreDto } from './dto/create-theatre.dto';
import { UpdateTheatreDto } from './dto/update-theatre.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request } from 'express';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('theatres')
export class TheatresController {
  constructor(private readonly theatresService: TheatresService) {}

  @Roles(Role.ADMIN, Role.THEATRE_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  async create(
    @Body() createTheatreDto: CreateTheatreDto,
    @Req() request: Request,
  ) {
    const email = request.headers.email as string;
    const role = request.headers.role as string;

    await this.theatresService.create(createTheatreDto, email);
    return {
      message: 'Theatre created successfully',
      status: 201,
    };
  }

  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
    @Query('movie') movie?: string,
  ) {
    return this.theatresService.findAll(movie, paginationDto);
  }

  @Roles(Role.ADMIN, Role.THEATRE_OWNER)
  @UseGuards(AuthGuard, RolesGuard)
  @Get(':id/screens')
  findAllScreens(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
    @Req() request: Request,
  ) {
    // const role = request.headers.role as string;
    // if (role === 'Customer') {
    //   throw new ForbiddenException(`Customers can't get screens of theatres`);
    // }
    const userId = request.headers.id as string;
    return this.theatresService.findAllScreens(+id, paginationDto, +userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.theatresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTheatreDto: UpdateTheatreDto) {
    return this.theatresService.update(+id, updateTheatreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.theatresService.remove(+id);
  }
}
