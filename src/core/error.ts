import { Verdict } from '../verdict';

export class CompileError extends Error {
  readonly verdict: Verdict;
  constructor(msg: string) {
    super(msg);
    this.verdict = Verdict.CompileError;
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
