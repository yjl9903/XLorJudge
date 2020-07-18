import { Controller, UseGuards, Post } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@Controller('polygon')
@UseGuards(AuthGuard)
export class PolygonController {
  @Post('/compile')
  async compile() {
    return true;
  }
}
