import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators/IsPublic.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('/chat')
  @Render('../views/test')
  showChat() {
    return;
  }
}
