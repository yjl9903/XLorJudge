import {
  Controller,
  UseGuards,
  Post,
  Body,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';

import { AuthGuard } from '../guards/auth.guard';

import { CompileDTO } from './types/polygon.dto';
import { PolygonService } from './polygon.service';

@Controller('polygon')
@UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class PolygonController {
  constructor(private polygonService: PolygonService) {}

  @Post('/compile')
  async compile(@Body() body: CompileDTO) {
    return this.polygonService.compile(body);
  }
}
