import { promises } from 'fs';
import * as path from 'path';

import { DATA_PATH } from '../configs';
import { makeTempDir, rimraf } from '../utils';
import { Verdict } from '../verdict';

// import { Interactor, InteractorRunner } from './interactor';
import { Result } from './result';
import { Generator } from './generator';

export class TestCase {
  fingerprint: string;
  inputFile: string;
  answerFile: string;

  constructor(fingerprint: string) {
    this.fingerprint = fingerprint;
    this.inputFile = path.join(DATA_PATH, fingerprint, 'in');
    this.answerFile = path.join(DATA_PATH, fingerprint, 'ans');
  }

  async getInput(): Promise<string> {
    try {
      return await promises.readFile(this.inputFile, 'utf8');
    } catch (err) {
      return '';
    }
  }

  async getAnswer(): Promise<string> {
    try {
      return await promises.readFile(this.answerFile, 'utf8');
    } catch (err) {
      return '';
    }
  }

  async writeIn(content: string): Promise<void> {
    try {
      await promises.mkdir(path.join(DATA_PATH, this.fingerprint));
    } catch (err) {
    } finally {
      await promises.writeFile(this.inputFile, content, 'utf8');
    }
  }

  private async writeAns(): Promise<void> {
    try {
      await promises.mkdir(path.join(DATA_PATH, this.fingerprint));
    } catch (err) {
    } finally {
      await promises.writeFile(this.answerFile, '', 'utf8');
    }
  }

  async genIn(generator: Generator, args: string[] = []): Promise<Result> {
    await this.clear();
    await this.writeIn('');

    const runDir = await makeTempDir();
    const genDir = await makeTempDir();
    const genErr = path.join(genDir, 'gen.err');

    try {
      // Run in 15s and 1024MB
      const result = await generator.run({
        workDir: runDir,
        fileBindings: [
          {
            mode: '-R',
            src: generator.fullFilePath,
            dst: generator.execute.file
          }
        ],
        executeCommand: generator.execute.command,
        executeArgs: [...generator.execute.args, ...args],
        maxTime: 15,
        maxMemory: 1024,
        stdoutFile: this.inputFile,
        stderrFile: genErr,
        trusted: true
      });
      if (result.verdict === Verdict.Accepted) {
        return result;
      } else {
        result.message = (await promises.readFile(genErr, 'utf8')).trim();
        await this.clear();
        return result;
      }
    } catch (err) {
      await this.clear();
      throw err;
    } finally {
      await rimraf(runDir);
      await rimraf(genDir);
    }
  }

  async genAns(generator: Generator): Promise<Result> {
    await this.writeAns();

    const runDir = await makeTempDir();
    const genDir = await makeTempDir();
    const genErr = path.join(genDir, 'gen.err');

    try {
      // Run in 15s and 1024MB
      const result = await generator.run({
        workDir: runDir,
        fileBindings: [
          {
            mode: '-R',
            src: generator.fullFilePath,
            dst: generator.execute.file
          }
        ],
        maxTime: 15,
        maxMemory: 1024,
        stdinFile: this.inputFile,
        stdoutFile: this.answerFile,
        stderrFile: genErr,
        trusted: true
      });
      if (result.verdict === Verdict.Accepted) {
        return result;
      } else {
        result.message = (await promises.readFile(genErr, 'utf8')).trim();
        await rimraf(this.answerFile);
        return result;
      }
    } catch (err) {
      await rimraf(this.answerFile);
      throw err;
    } finally {
      await rimraf(runDir);
      await rimraf(genDir);
    }
  }

  async clear() {
    try {
      await rimraf(path.join(DATA_PATH, this.fingerprint));
    } catch (err) {}
  }
}
