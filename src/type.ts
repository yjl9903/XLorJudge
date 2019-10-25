export enum Verdict {
  Compiling = -4,
  Waiting,
  Judging,
  WrongAnswer,
  Accepted,
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

export class Usage {
  user: number;
  pass: number;
  memory: number;
  exit: number;
  signal: number;

  constructor(file: string) {
    for (const line of file.trim().split('\n')) {
      const [key, val] = line.split(' ');
      this[key] = Number(val);
    }
  }

  parseUser() {
    return Number((this.user / 1000.0).toFixed(3));
  }
  parseMemory() {
    return Number((this.memory / 1024.0).toFixed(3));
  }
}
