import { promises } from 'fs';
import path from 'path';
import { Verdict } from '../verdict';

export class Result {
  time: number;
  memory: number;
  exit_code: number;
  signal: number;
  verdict: Verdict;
  constructor(
    time: number,
    memory: number,
    exit_code: number,
    signal: number,
    verdict: Verdict = Verdict.Accepted
  ) {
    this.time = time;
    this.memory = memory;
    this.exit_code = exit_code;
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

export async function usage2Result(
  info_dir: string,
  max_time: number,
  max_memory: number,
  real_time_limit: number
) {
  const usage = new Usage(
    await promises.readFile(path.join(info_dir, 'usage'), 'utf8')
  );
  const result = new Result(
    usage.parseUser(),
    usage.parseMemory(),
    usage.exit,
    usage.signal
  );
  // important
  if (result.exit_code !== 0) {
    result.verdict = Verdict.RuntimeError;
  }
  if (max_memory > 0 && result.memory > max_memory) {
    result.verdict = Verdict.MemoryLimitExceeded;
  } else if (max_time > 0 && result.time > max_time) {
    result.verdict = Verdict.TimeLimitExceeded;
  } else if (real_time_limit > 0 && usage.pass / 1000 > real_time_limit) {
    result.verdict = Verdict.IdlenessLimitExceeded;
  } else if (result.signal !== 0) {
    result.verdict = Verdict.RuntimeError;
  }
  return result;
}
