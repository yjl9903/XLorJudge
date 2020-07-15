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
