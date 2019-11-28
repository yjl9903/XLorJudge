import { promises } from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import { DATA_PATH } from '../configs';
import { make_temp_dir } from '../util';
import Submission from './submission';

class TestCase {
  fingerprint: string;
  input_file: string;
  answer_file: string;

  constructor(fingerprint: string) {
    this.fingerprint = fingerprint;
    this.input_file = path.join(DATA_PATH, fingerprint, fingerprint + '.in');
    this.answer_file = path.join(DATA_PATH, fingerprint, fingerprint + '.ans');
  }

  async write(type: string, content: string): Promise<void> {
    try {
      await promises.mkdir(path.join(DATA_PATH, this.fingerprint));
    } finally {
      return promises.writeFile(
        path.join(DATA_PATH, this.fingerprint, this.fingerprint + '.' + type),
        content,
        'utf8'
      );
    }
  }

  clear(): Promise<void> {
    return new Promise((res, rej) => {
      rimraf(path.join(DATA_PATH, this.fingerprint), err => {
        if (err) rej(err);
        else res();
      });
    });
  }

  async generateAns(
    code: string,
    lang: string,
    max_time: number,
    max_memory: number
  ) {
    await promises.writeFile(this.answer_file, '');

    const sub = new Submission(lang);

    try {
      await sub.compile(code, Math.max(max_time * 5, 15));
    } catch (err) {
      throw err;
    }

    const run_dir = await make_temp_dir();

    try {
      return await sub.run(
        run_dir,
        undefined,
        sub.lang_config['execute']['args'],
        undefined,
        true,
        max_time,
        max_memory,
        this.input_file,
        this.answer_file,
        null
      );
    } finally {
      rimraf(run_dir, () => {});
    }
  }
}

export default TestCase;
