export enum Verdict {
  Compiling = -4,
  Waiting,
  Judging,
  WrongAnswer,
  Accepted = 0,
  TimeLimitExceeded,
  IdlenessLimitExceeded,
  MemoryLimitExceeded,
  RuntimeError,
  SystemError,
  CompileError,
  Point,
  JudgeError,
  TestCaseError
}

export type JudgeVerdict =
  | typeof Verdict.Accepted
  | typeof Verdict.WrongAnswer
  | typeof Verdict.TimeLimitExceeded
  | typeof Verdict.IdlenessLimitExceeded
  | typeof Verdict.MemoryLimitExceeded
  | typeof Verdict.RuntimeError
  | typeof Verdict.Point;
