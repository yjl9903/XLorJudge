import { HttpModule, Module } from '@nestjs/common';
import { PolygonService } from './polygon.service';
import { PolygonController } from './polygon.controller';

@Module({
  imports: [HttpModule],
  providers: [PolygonService],
  controllers: [PolygonController]
})
export class PolygonModule {}
