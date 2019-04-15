enum Verdict {
  Waiting = -3,
  Judging,
  WrongAnswer,
  Accepted,
  TimeLimitExceeded,
  IdlenessLimitExceeded,
  MemoryLimitExceeded,
  RuntimeError,
  SystemError,
  CompileError,
}

export { Verdict };