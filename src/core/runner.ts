import { IRunner } from './type';
import { Submission } from './submission';
import { Result } from './result';
import { Verdict } from '../verdict';

export class Runner implements IRunner {
  submission: Submission;
  maxTime: number;
  maxMemory: number;

  async run(testcaseId: string) {
    return new Result(0, 0, 0, 0, Verdict.Accepted);
  }
}
