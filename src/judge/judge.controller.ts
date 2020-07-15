import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guard';

@Controller('judge')
@UseGuards(AuthGuard)
export class JudgeController {
  @Post('/')
  async judge() {
    return true;
  }
}
