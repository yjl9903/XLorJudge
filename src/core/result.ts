import { promises } from 'fs';
import * as path from 'path';
import { Verdict } from '../verdict';

export class Result {
  time: number;
  memory: number;
  exitCode: number;
  signal: number;
  verdict: Verdict;
  constructor(
    time: number,
    memory: number,
    exitCode: number,
    signal: number,
    verdict: Verdict = Verdict.Accepted
  ) {
    this.time = time;
    this.memory = memory;
    this.exitCode = exitCode;
    this.signal = signal;
    this.verdict = verdict;
  }
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

export async function usageToResult(
  infoDir: string,
  maxTime: number,
  maxMemory: number,
  realTimeLimit: number
) {
  const usage = new Usage(
    await promises.readFile(path.join(infoDir, 'usage'), 'utf8')
  );
  const result = new Result(
    usage.parseUser(),
    usage.parseMemory(),
    usage.exit,
    usage.signal
  );
  // important
  if (result.exitCode !== 0) {
    result.verdict = Verdict.RuntimeError;
  }
  if (maxMemory > 0 && result.memory > maxMemory) {
    result.verdict = Verdict.MemoryLimitExceeded;
  } else if (maxTime > 0 && result.time > maxTime) {
    result.verdict = Verdict.TimeLimitExceeded;
  } else if (realTimeLimit > 0 && usage.pass / 1000 > realTimeLimit) {
    result.verdict = Verdict.IdlenessLimitExceeded;
  } else if (result.signal !== 0) {
    result.verdict = Verdict.RuntimeError;
  }
  return result;
}
