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
  ForbiddenException,
} from '@nestjs/common';
import { ScreensService } from './screens.service';
import { CreateScreenDto } from './dto/create-screen.dto';
import { UpdateScreenDto } from './dto/update-screen.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import type { Request } from 'express';
import { Role, Roles } from 'src/auth/decorators/roles.decorator';

@Controller('screens')
export class ScreensController {
  constructor(private readonly screensService: ScreensService) {}

  @Roles(Role.ADMIN, Role.THEATRE_OWNER)
  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createScreenDto: CreateScreenDto,
    @Req() request: Request,
  ) {
    const id = request.headers.id as string;

    await this.screensService.create(createScreenDto, +id);
    return {
      message: 'Screen added successfully',
      status: 200,
    };
  }

  @Get()
  findAll() {
    return this.screensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.screensService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateScreenDto: UpdateScreenDto) {
    return this.screensService.update(+id, updateScreenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.screensService.remove(+id);
  }
}
