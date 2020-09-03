import { IRunner, ProblemType } from './type';
import { Submission } from './submission';
import { Checker } from './checker';
import { Runner as ClassicRunner } from './runner';
import { JudgeError } from './error';

export { ProblemType, SubmissionType } from './type';

export { CompileError, JudgeError, SystemError, TestCaseError } from './error';

export { Submission } from './submission';

export { TestCase } from './testcase';

export { Checker } from './checker';

export { Validator } from './validtor';

export function getRunner(
  type: ProblemType,
  submission: Submission,
  checker: Checker,
  maxTime: number,
  maxMemory: number
): IRunner {
  // TODO: classic runner and interactor.
  if (type === ProblemType.CLASSIC) {
    return new ClassicRunner(submission, checker, maxTime, maxMemory);
  } else {
    throw new JudgeError(`Do not support "${type}" problem`);
  }
}
