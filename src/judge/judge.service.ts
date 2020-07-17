import { Injectable } from '@nestjs/common';
import { JudgeSubmissionDTO } from './types/judge.dto';
import { Observer } from 'rxjs';
import { ResultMessage } from './types/result';

@Injectable()
export class JudgeService {
  async judge(
    observer: Observer<ResultMessage>,
    { id, maxTime, maxMemory, code, lang, cases }: JudgeSubmissionDTO
  ) {
    return maxTime;
  }
}
