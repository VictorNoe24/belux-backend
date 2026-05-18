import { Controller, Get } from '@nestjs/common';

import { ResponseMessage } from './common/decorators/response-message.decorator';
import { AppService } from './app.service';

@Controller({
  path: '',
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ResponseMessage('Application is running')
  getHello(): string {
    return this.appService.getHello();
  }
}
