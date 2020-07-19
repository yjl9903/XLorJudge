import { Injectable } from '@nestjs/common';
import { Observer } from 'rxjs';
import { JudgeSubmissionDTO } from './types/judge.dto';
import { ResultMessage } from './types/result';
import { Runner } from '../core/runner';
import { ProblemType } from '../core';
import { b64decode } from 'src/utils';

const ProblemRunner = new Map([[ProblemType.CLASSIC, Runner]]);

@Injectable()
export class JudgeService {
  async judge(
    observer: Observer<ResultMessage>,
    {
      type,
      id,
      maxTime,
      maxMemory,
      code: b64Code,
      lang,
      cases
    }: JudgeSubmissionDTO
  ) {
    const code = b64decode(b64Code);
    const runner = ProblemRunner.get(type);

    return maxTime;
  }
}
