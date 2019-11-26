import path from 'path';

import { CHK_PATH, LANG_CONFIG } from '../configs';
import { Verdict } from '../verdict';

import Result from './result';
import Submission, { SubmissionType } from './submission';
import { JudgeError } from './error';

export default class Checker extends Submission {
  constructor(id: string, lang: string) {
    super(
      lang,
      path.join(CHK_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']),
      SubmissionType.CHK
    );
  }

  clear(): void {}
}

export function getVerdict({ verdict, exit_code }: Result) {
  if (verdict !== Verdict.Accepted) {
    if (exit_code === 3) {
      throw new JudgeError('');
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
