import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { isUndef } from './utils';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const host = configService.get<string>('HOST') ?? 'localhost';
  const port = configService.get<string>('PORT') ?? 3000;

  if (isUndef(configService.get('USERNAME'))) {
    Logger.error('You shoulde specify a username');
    process.exit(1);
  }
  if (isUndef(configService.get('PASSWORD'))) {
    Logger.error('You shoulde specify a password');
    process.exit(1);
  }

  await app.listen(port, host);
}

bootstrap();
