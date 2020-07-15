import { Module } from '@nestjs/common';
import { PolygonService } from './polygon.service';

@Module({
  providers: [PolygonService]
})
export class PolygonModule {}
