import * as path from 'path';
import { promises } from 'fs';

import { makeTempDir, randomString, rimraf } from '../utils';
import { Verdict } from '../verdict';

import { IRunner } from './type';
import { Submission } from './submission';
import { Result } from './result';
import { Checker } from './checker';
import { TestCase } from './testcase';

export class Runner implements IRunner {
  submission: Submission;
  checker: Checker;
  maxTime: number;
  maxMemory: number;
  outDir?: string;

  constructor(
    submission: Submission,
    checker: Checker,
    maxTime: number,
    maxMemory: number
  ) {
    this.submission = submission;
    this.checker = checker;
    this.maxTime = maxTime;
    this.maxMemory = maxMemory;
  }

  private async makeWriteFile() {
    if (!this.outDir) {
      this.outDir = await makeTempDir();
    }
    const file = path.join(this.outDir, 'out_' + randomString());
    await promises.writeFile(file, '', 'utf8');
    await promises.chmod(file, 0o766);
    return file;
  }

  async clear() {
    if (this.outDir) {
      await rimraf(this.outDir);
    }
  }

  async run(testcaseId: string) {
    const [runDir, runOut, runErr] = await Promise.all([
      makeTempDir(),
      this.makeWriteFile(),
      this.makeWriteFile()
    ]);

    const testcase = new TestCase(testcaseId);

    try {
      const result = await this.submission.run({
        workDir: runDir,
        fileBindings: [
          {
            mode: '-R',
            src: path.join(
              this.submission.execute.dir,
              this.submission.execute.file
            ),
            dst: this.submission.execute.file
          }
        ],
        maxTime: this.maxTime,
        maxMemory: this.maxMemory,
        stdinFile: testcase.inputFile,
        stdoutFile: runOut,
        stderrFile: runErr
      });
      if (result.verdict === Verdict.Accepted) {
        result.verdict = await this.check(testcase, runOut);
      }
      return result;
    } finally {
      await rimraf(runDir);
    }
  }

  private async check(testcase: TestCase, runOut: string) {
    return Verdict.Accepted;
  }
}
