import { Verdict } from '../config'

class Result {
  time: number;
  memory: number;
  exit_code: number;
  verdict: Verdict;
  constructor(time: number, memory: number, exit_code: number, verdict: Verdict) {
    this.time = time;
    this.memory = memory;
    this.exit_code = exit_code;
    this.verdict = verdict;
  }
}

export { Result }