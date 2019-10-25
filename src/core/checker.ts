import path from 'path';

import Submission from './submission';
import Result from './result';
import { CHK_PATH, LANG_CONFIG } from '../configs';
import { Verdict } from '../verdict';

export default class Checker extends Submission {
  constructor(id: string, lang: string) {
    super(lang, path.join(CHK_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']));
  }

  clear(): void {}

  getVerdict(result: Result) {
    const { verdict, exit_code } = result;
    if (verdict !== Verdict.Accepted) {
      if (result.exit_code === 3) {
        return Verdict.JudgeError;
      }
      if (exit_code === 7) {
        return Verdict.Point;
      }
      if (verdict !== Verdict.RuntimeError) {
        return verdict;
      }
      return Verdict.WrongAnswer;
    }
    return Verdict.Accepted;
  }
}
