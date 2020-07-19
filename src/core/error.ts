import { Verdict } from '../verdict';

export class CompileError extends Error {
  readonly verdict: Verdict;
  constructor(msg: string) {
    super(msg);
    this.verdict = Verdict.CompileError;
  }

  static toHttpException(
    err: Error
  ): {
    status: string;
    verdict: Verdict.CompileError | Verdict.SystemError;
    message: string;
  } {
    if (err instanceof CompileError) {
      return {
        status: 'COMPILE_ERROR',
        verdict: Verdict.CompileError,
        message: err.message
      };
    } else {
      return {
        status: 'SYSTEM_ERROR',
        verdict: Verdict.SystemError,
        message: err.message
      };
    }
  }
}

export class SystemError extends Error {
  readonly verdict: Verdict;
  constructor(msg: string) {
    super(msg);
    this.verdict = Verdict.SystemError;
  }
}

export class TestCaseError extends Error {
  readonly verdict: Verdict;
  constructor(msg: string) {
    super(msg);
    this.verdict = Verdict.TestCaseError;
  }
}

export class JudgeError extends Error {
  readonly verdict: Verdict;
  constructor(msg: string) {
    super(msg);
    this.verdict = Verdict.JudgeError;
  }
}
