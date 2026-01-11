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
import { AuthGuard } from 'src/auth/auth.guard';
import type { Request } from 'express';

@Controller('screens')
export class ScreensController {
  constructor(private readonly screensService: ScreensService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Body() createScreenDto: CreateScreenDto,
    @Req() request: Request,
  ) {
    const id = request.headers.id as string;
    const role = request.headers.role as string;

    if (role === 'Customer') {
      throw new ForbiddenException(`Customers can't create screens`);
    }

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
