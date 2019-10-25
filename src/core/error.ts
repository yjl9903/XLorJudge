import { Verdict } from '../verdict';

export class CompileError extends Error {
  verdict: Verdict;
  constructor(msg: string) {
    super(msg);
    this.verdict = Verdict.CompileError;
  }
}

export class SystemError extends Error {
  verdict: Verdict;
  constructor(msg: string) {
    super(msg);
    this.verdict = Verdict.SystemError;
  }
}

export default CompileError;
