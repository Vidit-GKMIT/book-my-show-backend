import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import type { healthResponse } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  health(): Promise<healthResponse> {
    return this.appService.health();
  }
}
