import { Verdict } from 'verdict';

export default class Result {
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
