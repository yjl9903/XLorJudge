import path from 'path'

import { random_string } from '../util'
import { Verdict, SUB_PATH, LANG_CONFIG } from '../config'

import Result from './result'

class Submission {
  lang: string;
  langConfig: Object;
  exe_file: string;

  constructor(lang: string, exe_file?: string) {
    this.lang = lang;
    this.langConfig = LANG_CONFIG[lang];
    if (typeof exe_file === undefined) {
      this.exe_file = path.join(SUB_PATH, random_string());
    } else {
      this.exe_file = exe_file;
    }
  }

  clean(): void {

  }

  compile(code: number, max_time: number): void {

  }

  unsafe_run(): Result {

    return new Result(0, 0, 0, Verdict.Accepted);
  }

  run(): Result {

    return new Result(0, 0, 0, Verdict.Accepted);
  }

}

export default Submission;
