import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { JudgeModule } from './judge/judge.module';
import { PolygonModule } from './polygon/polygon.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JudgeModule,
    PolygonModule
  ],
  controllers: [AppController]
})
export class AppModule {}
