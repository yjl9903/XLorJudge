import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const host = configService.get<string>('HOST') ?? 'localhost';
  const port = configService.get<string>('PORT') ?? 3000;

  await app.listen(port, host);
}

bootstrap();
