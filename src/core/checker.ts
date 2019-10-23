import path from 'path';

import Submission from './submission';
import {
  CHK_PATH,
  LANG_CONFIG,
  Verdict,
  RUN_USER_ID,
  RUN_GROUP_ID
} from '../config';
import { exec } from '../util';
import Result from './result';

class Checker extends Submission {
  constructor(id: string, lang: string) {
    super(lang, path.join(CHK_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']));
  }
  clear(): void {}

  async check(
    work_dir: string,
    exe_file: string = null,
    args: Array<string> = [],
    files: Array<{ src: string; dst: string; mode: string }> = [],
    trusted: boolean = false,
    max_time: number,
    max_memory: number,
    stdin_file: string = null,
    stdout_file: string = null,
    stderr_file: string = null
  ): Promise<Result> {
    let real_time_limit = max_time * 2;
    for (let item of files) {
      args.push(item.src);
    }
    let flag: boolean = false;
    function Timeout(
      ms: number
    ): Promise<{ verdict: Verdict; code: number; signal: string }> {
      return new Promise((res, rej) => {
        setTimeout(() => {
          flag = true;
          res({ verdict: Verdict.TimeLimitExceeded, code: 3, signal: '' });
        }, ms);
      });
    }
    let result: { code: number; signal: string } = await Promise.race([
      exec(this.exe_file, args, { stdio: [null, null, null], uid: 0, gid: 0 }),
      Timeout(real_time_limit * 1000)
    ]);
    if (flag) return new Result(0, 0, 3, 0, Verdict.JudgeError);
    if (result.code === 0)
      return new Result(0, 0, result.code, 0, Verdict.Accepted);
    return new Result(0, 0, result.code, 0, Verdict.WrongAnswer);
  }
}

export default Checker;
