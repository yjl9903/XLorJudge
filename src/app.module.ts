import { Module } from '@nestjs/common';
import Configs from './configs';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { JudgeModule } from './judge/judge.module';
import { PolygonModule } from './polygon/polygon.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [Configs] }),
    JudgeModule,
    PolygonModule
  ],
  controllers: [AppController]
})
export class AppModule {}
