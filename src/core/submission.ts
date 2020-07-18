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

import { SubmissionType, ISubmissionRunParam, IFileBinding } from './type';
import { TestCaseError, SystemError, CompileError } from './error';
import { usageToResult } from './result';

const envArgs = [];
for (const env of ENV) {
  envArgs.push('-E', env);
}

export class Submission {
  lang: string;
  type: SubmissionType;
  execute: {
    file: string;
    command: string;
    args: string[];
  };

  constructor(lang: string, type = SubmissionType.SUB) {
    this.lang = lang;
    this.type = type;

    const fileName = randomString() + '.' + LangConfig[lang].compiledExtension;
    const langConfig = LangConfig[lang];

    this.execute = {
      file: fileName,
      command: langConfig.execute.command.replace(
        '${executableFile}',
        fileName
      ),
      args: langConfig.execute.args.map(s =>
        String(s).replace('${executableFile}', fileName)
      )
    };
  }

  clear() {
    return promises.unlink(path.join(SUB_PATH, this.execute.file));
  }

  async compile(code: string, maxTime = 16) {
    const langConfig = LangConfig[this.lang];

    const compileDir = await makeTempDir();
    const outFile = path.join(compileDir, 'compile');
    const errorFile = path.join(compileDir, 'compile.err');

    await Promise.all([
      promises.writeFile(
        path.join(compileDir, langConfig.sourceFileName),
        code
      ),
      promises.writeFile(outFile, ''),
      promises.writeFile(errorFile, '')
    ]);

    const compileConfigs = langConfig.compile;
    const compileSteps =
      compileConfigs instanceof Array ? compileConfigs : [compileConfigs];

    try {
      for (const { command, args, out = 'compile.out' } of compileSteps) {
        const result = await this.run({
          workDir: compileDir,
          executeCommand: command,
          executeArgs: args.map(s => {
            if (s === '${sourceFile}') {
              return langConfig.sourceFileName;
            } else if (s === '${compiledFile}') {
              return out;
            }
            return s;
          }),
          trusted: true,
          maxTime,
          maxMemory: 1024,
          stdoutFile: outFile,
          stderrFile: errorFile
        });

        if (result.verdict !== Verdict.Accepted) {
          const errorMsg = await promises.readFile(errorFile, 'utf8');
          rimraf(compileDir, () => {});
          if (errorMsg !== '') {
            throw new CompileError(errorMsg);
          } else if (result.verdict === Verdict.TimeLimitExceeded) {
            throw new CompileError('Time limit exceeded when compiling');
          } else if (result.verdict === Verdict.MemoryLimitExceeded) {
            throw new CompileError('Memory limit exceeded when compiling');
          } else {
            throw new CompileError(
              'Something is wrong, but, em, nothing is reported'
            );
          }
        }
      }

      const executeFilePath = path.join(SUB_PATH, this.execute.file);
      await promises.copyFile(
        path.join(compileDir, 'compile.out'),
        executeFilePath
      );
      await promises.chmod(executeFilePath, 0o0775);
    } catch (err) {
      throw err;
    } finally {
      rimraf(compileDir, () => {});
    }
  }

  async run({
    workDir,
    fileBindings = [],
    trusted = false,
    executeCommand = this.execute.command,
    executeArgs = this.execute.args,
    maxTime,
    maxMemory,
    stdinFile = null,
    stdoutFile = null,
    stderrFile = null
  }: ISubmissionRunParam) {
    const [rootDir, infoDir] = await this.prepareWorkDir();

    try {
      const [stdin, stdout, stderr] = await Submission.openRedirect(
        stdinFile,
        stdoutFile,
        stderrFile
      );

      try {
        await exec(
          NSJAIL_PATH,
          [
            ...Submission.buildNsjailArgs(
              workDir,
              rootDir,
              infoDir,
              trusted,
              fileBindings,
              maxTime,
              maxMemory
            ),
            executeCommand,
            ...executeArgs
          ],
          {
            stdio: [stdin, stdout, stderr],
            uid: 0,
            gid: 0
          }
        );

        await Submission.closeRedirect(stdin, stdout, stderr);
        return await usageToResult(infoDir, maxTime, maxMemory, maxTime * 2);
      } catch (err) {
        // Logger here
        throw new SystemError(err.message);
      }
    } catch (err) {
      throw err;
    } finally {
      await Submission.clearWorkDir(rootDir, infoDir);
    }
  }

  private static buildNsjailArgs(
    workDir: string,
    rootDir: string,
    infoDir: string,
    trusted: boolean,
    fileBindings: IFileBinding[],
    maxTime: number,
    maxMemory: number
  ) {
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

    return [
      ...nsjailArgs,
      ...extraFiles,
      '-D',
      '/app',
      ...limitArgs,
      ...envArgs,
      '--'
    ];
  }

  private async prepareWorkDir() {
    return Promise.all([makeTempDir(), makeTempDir()]);
  }

  private static async clearWorkDir(rootDir: string, infoDir: string) {
    return new Promise(res => {
      let ok = 0;
      rimraf(rootDir, () => {
        ok += 1;
        if (ok === 3) {
          res();
        }
      });
      rimraf(infoDir, () => {
        ok += 2;
        if (ok === 3) {
          res();
        }
      });
    });
  }

  private static async openRedirect(
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

  private static async closeRedirect(
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
