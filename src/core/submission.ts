import * as path from 'path';
import { promises } from 'fs';
import * as rimraf from 'rimraf';

import {
  SUB_PATH,
  LangConfig,
  COMPILER_GROUP_ID,
  COMPILER_USER_ID,
  RUN_USER_ID,
  RUN_GROUP_ID,
  OUTPUT_LIMIT,
  ENV,
  NSJAIL_PATH
} from '../configs';
import { randomString, makeTempDir, exec } from '../utils';
import { Verdict } from '../verdict';

import { SubmissionType, ISubmissionRunParam } from './type';
import { TestCaseError, SystemError } from './error';
import { usageToResult } from './result';
import { rejects } from 'assert';

const envArgs = [];
for (const env of ENV) {
  envArgs.push('-E', env);
}

export class Submission {
  lang: string;
  type: SubmissionType;
  executeFile: string;

  constructor(lang: string, type = SubmissionType.SUB) {
    this.lang = lang;
    this.type = type;
    this.executeFile = path.join(
      SUB_PATH,
      randomString() + '.' + LangConfig[lang].compiledExtension
    );
  }

  clear() {
    return promises.unlink(this.executeFile);
  }

  async compile() {}

  async run({
    workDir,
    fileBindings = [],
    trusted = false,
    executeFile = this.executeFile,
    executeArgs = [],
    maxTime,
    maxMemory,
    stdinFile = null,
    stdoutFile = null,
    stderrFile = null
  }: ISubmissionRunParam) {
    const [rootDir, infoDir] = await this.prepareWorkDir();

    const uid = trusted ? COMPILER_USER_ID : RUN_USER_ID;
    const gid = trusted ? COMPILER_GROUP_ID : RUN_GROUP_ID;

    const nsjailArgs = [
      '-Mo',
      '--chroot',
      rootDir,
      '--user',
      uid,
      '--group',
      gid,
      '--log',
      path.join(infoDir, 'log'),
      '--usage',
      path.join(infoDir, 'usage'),
      '-R',
      '/bin',
      '-R',
      '/lib',
      '-R',
      '/lib64',
      '-R',
      '/usr',
      '-R',
      '/sbin',
      '-R',
      '/dev',
      '-R',
      '/etc',
      trusted ? '-B' : '-R',
      workDir + ':/app'
    ];

    const readlTimeLimit = maxTime * 2;

    const limitArgs = [
      '--cgroup_pids_max',
      64,
      '--cgroup_cpu_ms_per_sec',
      1000,
      '--cgroup_mem_max',
      (maxMemory + 32) * 1024 * 1024,
      '--time_limit',
      readlTimeLimit + 1,
      '--rlimit_cpu',
      maxTime + 1,
      '--rlimit_as',
      'inf',
      '--rlimit_stack',
      Math.max(maxMemory + 32, 256),
      '--rlimit_fsize',
      OUTPUT_LIMIT
    ];

    const extraFiles = [];
    for (const { src, dst, mode } of fileBindings) {
      extraFiles.push(mode, src + ':/app/' + dst);
    }

    try {
      const [stdin, stdout, stderr] = await this.openRedirect(
        stdinFile,
        stdoutFile,
        stderrFile
      );

      try {
        await exec(
          NSJAIL_PATH,
          [
            ...nsjailArgs,
            ...extraFiles,
            '-D',
            '/app',
            ...limitArgs,
            ...envArgs,
            '--',
            executeFile,
            ...executeArgs
          ],
          {
            stdio: [stdin, stdout, stderr],
            uid: 0,
            gid: 0
          }
        );
        await this.closeRedirect(stdin, stdout, stderr);
        return await usageToResult(
          infoDir,
          maxTime,
          maxMemory,
          readlTimeLimit
        );
      } catch (err) {
        // Logger here
        throw new SystemError(err.message);
      }
    } catch (err) {
      throw err;
    } finally {
      await this.clearWorkDir(rootDir, infoDir);
    }
  }

  private async prepareWorkDir() {
    return Promise.all([makeTempDir(), makeTempDir()]);
  }

  private async clearWorkDir(rootDir: string, infoDir: string) {
    return new Promise((res, rej) => {
      let ok = 0;
      rimraf(rootDir, err => {
        if (err) {
          rej(err);
        }
        ok += 1;
        if (ok === 3) {
          res();
        }
      });
      rimraf(infoDir, err => {
        if (err) {
          rej(err);
        }
        ok += 2;
        if (ok === 3) {
          res();
        }
      });
    });
  }

  private async openRedirect(
    stdinFile?: string,
    stdoutFile?: string,
    stderrFile?: string
  ) {
    const result: Array<'ignore' | promises.FileHandle> = [
      'ignore',
      'ignore',
      'ignore'
    ];
    try {
      if (stdinFile) {
        result[0] = await promises.open(stdinFile, 'r');
      }
      if (stdoutFile) {
        result[1] = await promises.open(stdoutFile, 'w');
      }
      if (stderrFile) {
        result[2] = await promises.open(stderrFile, 'w');
      }
      return result;
    } catch (err) {
      throw new TestCaseError(err.message);
    }
  }

  private async closeRedirect(
    stdin: 'ignore' | promises.FileHandle,
    stdout: 'ignore' | promises.FileHandle,
    stderr: 'ignore' | promises.FileHandle
  ) {
    const closeTasks = [];
    if (stdin instanceof Object) {
      closeTasks.push(stdin.close());
    }
    if (stdout instanceof Object) {
      closeTasks.push(stdout.close());
    }
    if (stderr instanceof Object) {
      closeTasks.push(stderr.close());
    }
    return Promise.all(closeTasks);
  }
}
