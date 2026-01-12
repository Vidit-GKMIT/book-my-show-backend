import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ForbiddenException,
  Req,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import type { Request } from 'express';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @Req() request: Request,
  ) {
    const role = request.headers.role as string;
    if (role !== 'Admin') {
      throw new ForbiddenException('Only admins can create movies');
    }
    await this.moviesService.create(createMovieDto);
    return {
      message: 'Movie created successfully',
      status: 201,
    };
  }

  @Get()
  async findAll(
    @Query('city') city: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const x = await this.moviesService.findAll(city, paginationDto);
    return x;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }
}
