import {
  Controller,
  UseGuards,
  Post,
  Body,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext
} from '@nestjs/microservices';
import 'rxjs/add/operator/bufferCount';

import { AuthGuard } from '../guards/auth.guard';

import { CompileDTO } from './types/polygon.dto';
import { BuildTaskDto } from './types/build-task.dto';
import { PolygonService } from './polygon.service';

@Controller('polygon')
@UseGuards(AuthGuard)
export class PolygonController {
  constructor(private polygonService: PolygonService) {}

  @Post('/compile')
  @UsePipes(new ValidationPipe({ transform: true }))
  async compile(@Body() body: CompileDTO) {
    return this.polygonService.compile(body);
  }

  @Post('/build')
  @UsePipes(new ValidationPipe({ transform: true }))
  buildHttp(@Body() buildTaskDto: BuildTaskDto) {
    return this.polygonService.build(buildTaskDto).bufferCount(9999);
  }

  @MessagePattern('build')
  build(
    @Payload(new ValidationPipe({ transform: false }))
    buildTaskDto: BuildTaskDto,
    @Ctx() context: RmqContext
  ) {
    return this.polygonService.build(buildTaskDto);
  }
}
