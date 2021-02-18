import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { Allow } from 'class-validator';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Welcome' })
  @Allow()
  @Get()
  root(): string {
    return `<h3>Welcome to Sumo API</h3>
            <br/>Checkout <a href="/api/swagger">API Docs</a>
            <br/><code>Version: 1.0.0</code>`;
  }
}
