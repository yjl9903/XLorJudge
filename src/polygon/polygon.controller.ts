import {
  Controller,
  UseGuards,
  Post,
  Body,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import 'rxjs/add/operator/bufferCount';

import { AuthGuard } from '../guards/auth.guard';

import { CompileDTO } from './types/polygon.dto';
import { PolygonService } from './polygon.service';
import { BuildTaskDto } from './types/build-task.dto';

@Controller('polygon')
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class PolygonController {
  constructor(private polygonService: PolygonService) {}

  @Post('/compile')
  async compile(@Body() body: CompileDTO) {
    return this.polygonService.compile(body);
  }

  @MessagePattern('build')
  build(@Payload() buildTaskDto: BuildTaskDto) {
    return this.polygonService.build(buildTaskDto);
  }

  @Post('/build')
  buildHttp(@Body() buildTaskDto: BuildTaskDto) {
    return this.polygonService.build(buildTaskDto).bufferCount(9999);
  }
}
