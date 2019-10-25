import { promises } from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { DATA_PATH } from '../configs';

class TestCase {
  fingerprint: string;
  input_file: string;
  output_file: string;

  constructor(fingerprint: string) {
    this.fingerprint = fingerprint;
    this.input_file = path.join(DATA_PATH, fingerprint, fingerprint + '.in');
    this.output_file = path.join(DATA_PATH, fingerprint, fingerprint + '.out');
  }

  async write(type: string, content: string): Promise<void> {
    try {
      await promises.mkdir(path.join(DATA_PATH, this.fingerprint));
    } catch (err) {}
    return promises.writeFile(
      path.join(DATA_PATH, this.fingerprint, this.fingerprint + '.' + type),
      content,
      'utf8'
    );
  }

  clear(): Promise<void> {
    return new Promise((res, rej) => {
      rimraf(path.join(DATA_PATH, this.fingerprint), err => {
        if (err) rej(err);
        else res();
      });
    });
  }
}

export default TestCase;
