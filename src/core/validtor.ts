import * as path from 'path';

import { Submission } from './submission';
import { SubmissionType } from './type';
import { LangConfig, VAL_PATH } from '../configs';
import { TestCase } from './testcase';
import { makeTempDir, rimraf } from '../utils';
import { Verdict } from '../verdict';
import { promises } from 'fs';

export class Validator extends Submission {
  constructor(id: string, lang: string) {
    super(lang, SubmissionType.VAL, {
      file: id + '.' + LangConfig[lang].compiledExtension,
      dir: VAL_PATH,
    });
  }

  async clear(): Promise<void> {}

  async validate(testcaseId: string) {
    const testcase = new TestCase(testcaseId);

    const runDir = await makeTempDir();
    const valDir = await makeTempDir();
    const valErr = path.join(valDir, 'val.err');

    try {
      // Run in 15s and 1024MB
      const result = await this.run({
        workDir: runDir,
        fileBindings: [
          {
            mode: '-R',
            src: this.fullFilePath,
            dst: this.execute.file,
          },
        ],
        maxTime: 15,
        maxMemory: 1024,
        stdinFile: testcase.inputFile,
        stderrFile: valErr,
        trusted: true,
      });
      if (result.verdict === Verdict.Accepted) {
        return result;
      } else {
        result.message = (await promises.readFile(valErr, 'utf8')).trim();
        return result;
      }
    } finally {
      await rimraf(runDir);
      await rimraf(valDir);
    }
  }
}
