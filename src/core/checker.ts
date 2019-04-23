import path from 'path'

import Submission from './submission'
import { CHK_PATH, LANG_CONFIG } from '../config'

class Checker extends Submission {
  constructor(id: string, lang: string) {
    super(lang, path.join(CHK_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']));
  }
  clear(): void {

  }
}

export default Checker;