import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('/')
export class AppController {
  constructor(private readonly configService: ConfigService) {}

  @Get()
  getHello(): string {
    return `This is XLoJ Judge Server, from "${this.configService.get<string>(
      'SERVER_NAME'
    )}".`;
  }
}
