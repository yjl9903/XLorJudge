import { promises } from 'fs';
import * as path from 'path';
import rimraf from 'rimraf';

import { DATA_PATH } from '../configs';
// import { make_temp_dir } from '../util';
// import { Verdict } from '../verdict';
// import { Interactor, InteractorRunner } from './interactor';
// import Submission from './submission';

export class TestCase {
  fingerprint: string;
  inputFile: string;
  answerFile: string;

  constructor(fingerprint: string) {
    this.fingerprint = fingerprint;
    this.inputFile = path.join(DATA_PATH, fingerprint, 'in');
    this.answerFile = path.join(DATA_PATH, fingerprint, 'ans');
  }

  async write(type: 'in' | 'ans', content: string): Promise<void> {
    try {
      await promises.mkdir(path.join(DATA_PATH, this.fingerprint));
    } catch (err) {}
    if (type === 'in') {
      return promises.writeFile(this.inputFile, content, 'utf8');
    } else {
      return promises.writeFile(this.answerFile, content, 'utf8');
    }
  }

  clear(): Promise<void> {
    return new Promise((res, rej) => {
      rimraf(path.join(DATA_PATH, this.fingerprint), err => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    });
  }
}
