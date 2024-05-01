import { Controller, Get, Render } from '@nestjs/common';
import { Public } from './auth/decorators/IsPublic.decorator';

@Controller()
export class AppController {
  constructor() {}
  @Public()
  @Get('/chat')
  @Render('../views/test')
  showChat() {
    return;
  }
}
