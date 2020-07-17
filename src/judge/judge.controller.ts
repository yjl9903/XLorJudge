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
import { HTTPJudgeSubmissionDTO } from './types/judge.dto';
import { Observable, Observer } from 'rxjs';

import { ResultMessage } from './types/result';
import { Verdict } from '../verdict';

@Controller('/')
@UseGuards(AuthGuard)
export class JudgeController {
  constructor(private judgeService: JudgeService) {}

  @Post('/judge')
  @UsePipes(new ValidationPipe({ transform: true }))
  async judge(@Body() body: HTTPJudgeSubmissionDTO) {
    const task: Observable<ResultMessage> = Observable.create(
      (observer: Observer<ResultMessage>) => {
        observer.next({ id: body.id, verdict: Verdict.Waiting });
        this.judgeService.judge(observer, body);
      }
    );
    if (body.isSync) {
      return task;
    }
    return { id: body.id, verdict: Verdict.Waiting };
  }

  @Get('/query/:id')
  async query(@Param('id') id: string) {
    return id;
  }
}
