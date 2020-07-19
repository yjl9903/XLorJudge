import { CHK_PATH, LangConfig } from '../configs';
import { Verdict } from '../verdict';

import { Result } from './result';
import { Submission } from './submission';
import { JudgeError } from './error';
import { SubmissionType } from './type';

export class Checker extends Submission {
  constructor(id: string, lang: string) {
    super(lang, SubmissionType.CHK, {
      file: id + '.' + LangConfig[lang].compiledExtension,
      dir: CHK_PATH
    });
  }

  clear(): Promise<void> {
    return;
  }

  static getVerdict({ verdict, exitCode }: Result) {
    if (verdict !== Verdict.Accepted) {
      if (exitCode === 3) {
        throw new JudgeError('');
      }
      if (exitCode === 7) {
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
