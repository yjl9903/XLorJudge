import * as path from 'path';
import { promises } from 'fs';

import { makeTempDir, randomString, rimraf, readFileHead } from '../utils';
import { Verdict } from '../verdict';

import { IRunner, RunOptions, IFileBinding } from './type';
import { Submission } from './submission';
import { Result, ResultWithReport } from './result';
import { Checker } from './checker';
import { TestCase } from './testcase';
import { JudgeError } from './error';

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

  private async makeWriteFile(extension = 'out') {
    if (!this.outDir) {
      this.outDir = await makeTempDir();
    }
    const file = path.join(this.outDir, randomString() + '.' + extension);
    await promises.writeFile(file, '', 'utf8');
    await promises.chmod(file, 0o766);
    return file;
  }

  async clear() {
    if (this.outDir) {
      await rimraf(this.outDir);
    }
  }

  async run(
    testcaseId: string,
    { returnReport = false }: RunOptions = {}
  ): Promise<Result | ResultWithReport> {
    const [runDir, runOut, runErr] = await Promise.all([
      makeTempDir(),
      this.makeWriteFile('out'),
      this.makeWriteFile('err')
    ]);

    const testcase = new TestCase(testcaseId);

    try {
      const result: Result | ResultWithReport = await this.submission.run({
        workDir: runDir,
        fileBindings: [
          {
            mode: '-R',
            src: this.submission.fullFilePath,
            dst: this.submission.execute.file
          }
        ],
        maxTime: this.maxTime,
        maxMemory: this.maxMemory,
        stdinFile: testcase.inputFile,
        stdoutFile: runOut,
        stderrFile: runErr
      });

      if (returnReport) {
        (result as ResultWithReport).output = await readFileHead(runOut);
      }

      if (result.verdict === Verdict.Accepted) {
        if (returnReport) {
          result.verdict = await this.check(
            testcase,
            runOut,
            result as ResultWithReport
          );
        } else {
          result.verdict = await this.check(testcase, runOut);
        }
      }
      return result;
    } finally {
      await rimraf(runDir);
    }
  }

  private async check(
    testcase: TestCase,
    runOut: string,
    result?: ResultWithReport
  ) {
    const chkOut = await this.makeWriteFile('chk');
    const workDir = await makeTempDir();

    const files: IFileBinding[] = [
      {
        src: this.checker.fullFilePath,
        dst: this.checker.execute.file,
        mode: '-R'
      },
      { src: testcase.inputFile, dst: 'in', mode: '-R' },
      { src: runOut, dst: 'out', mode: '-R' },
      { src: testcase.answerFile, dst: 'ans', mode: '-R' },
      { src: chkOut, dst: 'result', mode: '-B' }
    ];

    try {
      const chkResult = await this.checker.run({
        workDir,
        fileBindings: files,
        executeArgs: ['in', 'out', 'ans', 'result'],
        maxTime: this.maxTime * 2,
        maxMemory: this.maxMemory * 2
      });

      if (result !== undefined) {
        result.checkerOutput = await readFileHead(chkOut);
      }

      return Checker.getVerdict(chkResult);
    } catch (err) {
      // handle judge error message
      if (err instanceof JudgeError) {
        err.message = await readFileHead(chkOut);
      }
      throw err;
    } finally {
      await rimraf(workDir);
    }
  }
}
