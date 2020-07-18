import { Module } from '@nestjs/common';
import { PolygonService } from './polygon.service';
import { PolygonController } from './polygon.controller';

@Module({
  providers: [PolygonService],
  controllers: [PolygonController]
})
export class PolygonModule {}
