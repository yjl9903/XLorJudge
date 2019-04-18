import path from 'path'
import { constants, promises } from 'fs'

import { DATA_PATH } from '../config'

class TestCase {
  fingerprint: string;
  input_file: string;
  output_file: string;

  constructor(fingerprint: string) {
    this.fingerprint = fingerprint;
  }

  async write(type: string, content: string): Promise<void> {
    try {
      await promises.mkdir(path.join(DATA_PATH, this.fingerprint));
    } catch(ex) {

    }
    promises.writeFile(path.join(DATA_PATH, this.fingerprint, this.fingerprint + '.' + type), content, 'utf8');
  }

  async isExist(): Promise<boolean> {
    let f = false, g = false;
    try {
      await promises.access(path.join(DATA_PATH, this.fingerprint, this.fingerprint + '.in'), constants.R_OK).then(() => { f = true; });
      await promises.access(path.join(DATA_PATH, this.fingerprint, this.fingerprint + '.out'), constants.R_OK).then(() => { g = true; });
    } catch(ex) {
      return false;
    }
    return f && g;
  }
}

export default TestCase;