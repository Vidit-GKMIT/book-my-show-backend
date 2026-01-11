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
import { AuthGuard } from 'src/auth/auth.guard';
import type { Request } from 'express';
import { PaginationDto } from 'src/common/dto/pagination-dto';

@Controller('theatres')
export class TheatresController {
  constructor(private readonly theatresService: TheatresService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createTheatreDto: CreateTheatreDto,
    @Req() request: Request,
  ) {
    const email = request.headers.email as string;
    const role = request.headers.role as string;

    if (role === 'Customer') {
      throw new ForbiddenException(`Customers can't create theatres`);
    }

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

  @UseGuards(AuthGuard)
  @Get(':id/screens')
  findAllScreens(
    @Param('id') id: string,
    @Query() paginationDto: PaginationDto,
    // @Req() request: Request,
  ) {
    // const role = request.headers.role as string;
    // if (role === 'Customer') {
    //   throw new ForbiddenException(`Customers can't get screens of theatres`);
    // }
    return this.theatresService.findAllScreens(+id, paginationDto);
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
