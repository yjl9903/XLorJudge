import { Injectable } from '@nestjs/common';
import { Observable, Observer } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/first';

import { Verdict } from '../verdict';
import { b64decode } from '../utils';
import { Submission, CompileError, Checker, getRunner } from '../core';

import { JudgeSubmissionDTO, JudgingMessage, ResultMessage } from './types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JudgeService {
  constructor(private readonly configService: ConfigService) {}

  judge(body: JudgeSubmissionDTO) {
    return new Observable((observer: Observer<ResultMessage>) => {
      // Waiting.
      observer.next({ verdict: Verdict.Waiting });
      JudgeService.innerJudge(observer, body);
    }).map((value: ResultMessage) => ({
      id: body.id,
      timestamp: new Date().toISOString(),
      from: this.configService.get<string>('SERVER_NAME'),
      ...value
    }));
    // TODO: logger
  }

  private static async innerJudge(
    observer: Observer<ResultMessage>,
    {
      type,
      maxTime,
      maxMemory,
      checker: checkerInfo,
      code: b64Code,
      lang,
      cases,
      returnReport = false,
      isTestAllCases = false
    }: JudgeSubmissionDTO
  ) {
    const code = b64decode(b64Code);
    const submission = new Submission(lang);

    // Compile
    observer.next({ verdict: Verdict.Compiling });
    try {
      await submission.compile(code, Math.max(maxTime * 5, 15));
    } catch (err) {
      const exceptionInfo = CompileError.toHttpException(err);
      observer.next(exceptionInfo);
      observer.complete();
      return;
    }

    const checker = new Checker(checkerInfo.id, checkerInfo.lang);
    const runner = getRunner(
      type, // may throw errors for unsupported problem type
      submission,
      checker,
      maxTime,
      maxMemory
    );

    for (const testcaseId of cases) {
      try {
        const result = await runner.run(testcaseId, { returnReport });

        // TODO: design result message body
        const message: JudgingMessage = {
          testcaseId,
          verdict: result.verdict,
          time: result.time,
          memory: result.memory
        };

        if (returnReport) {
          if ('stdout' in result) {
            message.stdout = result.stdout;
          }
          if ('checkerOut' in result) {
            message.checkerOut = result.checkerOut;
          }
        }

        observer.next(message);

        if (!isTestAllCases && result.verdict !== Verdict.Accepted) {
          break;
        }
      } catch (error) {
        // TODO: handle system error, testcase error ans so on
      }
    }

    await runner.clear();

    observer.complete();
  }
}
