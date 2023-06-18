import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthorityService } from './sockets/cache/authority.service';

@Controller('')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authorityService: AuthorityService,
  ) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/debug/:id')
  getDebug(@Param() params: any): any {
    return this.authorityService.getRoomDebugData(params.id);
  }
}
