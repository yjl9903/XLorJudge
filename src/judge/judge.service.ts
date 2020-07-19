import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Observer } from 'rxjs';

import { Runner as ClassicRunner, Runner } from '../core/runner';
import { ProblemType, Submission, CompileError, Checker } from '../core';
import { b64decode } from '../utils';

import {
  JudgeSubmissionDTO,
  HTTPJudgeSubmissionOptions
} from './types/judge.dto';
import { ResultMessage } from './types/result';
import { Verdict } from 'src/verdict';

@Injectable()
export class JudgeService {
  async judge(
    observer: Observer<ResultMessage>,
    {
      type,
      maxTime,
      maxMemory,
      code: b64Code,
      lang,
      cases,
      returnReport = false
    }: JudgeSubmissionDTO,
    { isTestAllCases = false }: HTTPJudgeSubmissionOptions = {}
  ) {
    const code = b64decode(b64Code);
    const submission = new Submission(lang);
    const checker = new Checker('123', 'cpp'); // TODO: add checker
    const runner = this.getRunner(
      type,
      submission,
      checker,
      maxTime,
      maxMemory
    );

    try {
      await submission.compile(code, Math.max(maxTime * 5, 15));
    } catch (err) {
      const exceptionInfo = CompileError.toHttpException(err);
      observer.next(exceptionInfo);
      observer.complete();
      return;
    }

    for (const testcaseId of cases) {
      try {
        const result = await runner.run(testcaseId, { returnReport });

        // TODO: design result message body
        observer.next({
          verdict: result.verdict,
          time: result.time,
          memory: result.memory
        });

        if (!isTestAllCases && result.verdict !== Verdict.Accepted) {
          break;
        }
      } catch (error) {
        // TODO: handle system error, testcase error ans so on
      }
    }

    observer.complete();
  }

  private getRunner(
    type: ProblemType,
    submission: Submission,
    checker: Checker,
    maxTime: number,
    maxMemory: number
  ) {
    return new ClassicRunner(submission, checker, maxTime, maxMemory);
  }
}
