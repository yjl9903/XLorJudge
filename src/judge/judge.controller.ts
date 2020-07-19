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
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/first';

import { ResultMessage } from './types/result';
import { Verdict } from '../verdict';

@Controller('/')
@UseGuards(AuthGuard)
export class JudgeController {
  constructor(private judgeService: JudgeService) {}

  @Post('/judge')
  @UsePipes(new ValidationPipe({ transform: true }))
  async judge(@Body() body: HTTPJudgeSubmissionDTO) {
    const task = Observable.create((observer: Observer<ResultMessage>) => {
      observer.next({ verdict: Verdict.Waiting });
      this.judgeService.judge(observer, body);
    }).map((value: ResultMessage) => ({
      id: body.id,
      lang: body.lang,
      type: body.type,
      timestamp: new Date().toISOString(),
      ...value
    }));
    // TODO: add pipe to transform above messages
    if (body.isSync) {
      return task.skip(2).bufferCount(body.cases.length);
    }
    return task.first();
  }

  @Get('/query/:id')
  async query(@Param('id') id: string) {
    return id;
  }
}
