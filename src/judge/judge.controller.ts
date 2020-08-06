import {
  Controller,
  Post,
  UseGuards,
  Get,
  Param,
  Body,
  UsePipes,
  ValidationPipe
} from '@nestjs/common';

import { AuthGuard } from '../guards/auth.guard';

import { JudgeService } from './judge.service';
import { JudgeSubmissionDTO as HTTPJudgeSubmissionDTO } from './types/judge.dto';

@Controller('/')
@UseGuards(AuthGuard)
export class JudgeController {
  constructor(private judgeService: JudgeService) {}

  @Post('/judge')
  @UsePipes(new ValidationPipe({ transform: true }))
  async judge(@Body() body: HTTPJudgeSubmissionDTO) {
    const task = this.judgeService.judge(body);
    // TODO: pipe task message to a cache, Map or Redis?
    if (body.isSync) {
      // Skip waiting and compiling.
      return task.skip(2).bufferCount(body.cases.length);
    } else {
      // return waiting message.
      return task.first();
    }
  }

  @Get('/query/:id')
  async query(@Param('id') id: string) {
    // TODO: query judge state
    return id;
  }
}
