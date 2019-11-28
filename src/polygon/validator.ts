import path from 'path';

import { VAL_PATH, LANG_CONFIG } from '../configs';
import { Submission, SubmissionType } from '../core';

export default class Generator extends Submission {
  constructor(id: string, lang: string) {
    super(
      lang,
      path.join(VAL_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']),
      SubmissionType.VAL
    );
  }
}
