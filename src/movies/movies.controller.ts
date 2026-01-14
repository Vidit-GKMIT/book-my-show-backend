import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  // ForbiddenException,
  Req,
  UseInterceptors,
  // UploadedFile,
  UploadedFiles,
  BadRequestException,
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PaginationDto } from 'src/common/dto/pagination-dto';
import type { Request } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'poster', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @Req() request: Request,
    @UploadedFiles()
    file: {
      poster: Express.Multer.File;
      trailer: Express.Multer.File;
    },
  ) {
    if (!file.poster || !file.trailer) {
      throw new BadRequestException('file required!');
    }
    await this.moviesService.create(createMovieDto, file.poster, file.trailer);
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
    const { data, page, limit, totalPages } = await this.moviesService.findAll(
      city,
      paginationDto,
    );
    return {
      data,
      pagination: {
        page,
        limit,
        totalPages,
      },
      message: 'Data fetched successfully',
      status: 200,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Roles(Role.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.moviesService.remove(+id);
    return {
      message: 'Movie removed successfully',
      status: 204,
    };
  }
}
