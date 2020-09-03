import { GEN_PATH, LangConfig } from '../configs';

import { Submission } from './submission';
import { SubmissionType } from './type';

export class Generator extends Submission {
  constructor(id: string, lang: string) {
    super(lang, SubmissionType.GEN, {
      file: id + '.' + LangConfig[lang].compiledExtension,
      dir: GEN_PATH
    });
  }

  clear(): Promise<void> {
    return;
  }
}
