import { promises, unlink } from 'fs';
import path from 'path';
import rimraf from 'rimraf';

import {
  COMPILER_GROUP_ID,
  COMPILER_USER_ID,
  ENV,
  LANG_CONFIG,
  NSJAIL_PATH,
  OUTPUT_LIMIT,
  RUN_GROUP_ID,
  RUN_USER_ID,
  SUB_PATH
} from '../configs';
import { exec, make_temp_dir, random_string } from '../util';
import { Verdict } from '../verdict';

import { CompileError, SystemError, TestCaseError } from './error';
import Result from './result';
import { usage2Result } from './usage';

export enum SubmissionType {
  SUB = 'Submission',
  CHK = 'Checker',
  GEN = 'Generator',
  VAL = 'Validator',
  INT = 'Interactor'
}

class Submission {
  lang: string;
  lang_config: Object;
  exe_file: string;
  type: SubmissionType;

  constructor(
    lang: string,
    exe_file?: string,
    type: SubmissionType = SubmissionType.SUB
  ) {
    this.lang = lang;
    this.lang_config = LANG_CONFIG[lang];
    if (exe_file === undefined) {
      this.exe_file = path.join(
        SUB_PATH,
        random_string() + '.' + this.lang_config['exe_ext']
      );
    } else {
      this.exe_file = exe_file;
    }
    this.type = type;
  }

  clear(): void {
    unlink(this.exe_file, () => {});
  }

  async compile(code: string, max_time: number): Promise<void> {
    const compile_dir = await make_temp_dir();
    let compile_out = this.lang_config['compile'].out || 'compile.out';
    const error_path = path.join(compile_dir, 'compiler.err');

    // write code into a file
    await promises.writeFile(
      path.join(compile_dir, this.lang_config['code_file']),
      code
    );
    await promises.writeFile(error_path, '');

    // run compile command
    const cmd = this.lang_config['compile'].cmd;
    const args = this.lang_config['compile'].args.map((arg: string) => {
      if (arg === '{code_file}') arg = this.lang_config['code_file'];
      else if (arg === '{exe_file}') arg = compile_out;
      return arg;
    });

    const result = await this.run(
      compile_dir,
      cmd,
      args,
      [],
      true,
      max_time,
      1024,
      null,
      error_path,
      error_path
    );

    if (result.verdict !== Verdict.Accepted) {
      let error_msg = await promises.readFile(error_path, 'utf8');
      if (error_msg === '') {
        if (result.verdict === Verdict.TimeLimitExceeded) {
          error_msg = 'Time limit exceeded when compiling';
        } else if (result.verdict === Verdict.MemoryLimitExceeded) {
          error_msg = 'Memory limit exceeded when compiling';
        } else {
          error_msg = 'Something is wrong, but, em, nothing is reported';
        }
      }
      rimraf(compile_dir, () => {});
      throw new CompileError(error_msg);
    }

    if ('cmd2' in this.lang_config['compile']) {
      // For java...
      compile_out = 'compile.out';
      const cmd = this.lang_config['compile'].cmd2;
      const args = this.lang_config['compile'].args2.map((arg: string) => {
        if (arg === '{code_file}') arg = this.lang_config['code_file'];
        else if (arg === '{exe_file}') arg = compile_out;
        return arg;
      });

      await promises.writeFile(error_path, ''); // important
      const result = await this.run(
        compile_dir,
        cmd,
        args,
        [],
        true,
        max_time,
        1024,
        null,
        null,
        error_path
      );

      if (result.verdict !== Verdict.Accepted) {
        let error_msg = await promises.readFile(error_path, 'utf8');
        if (error_msg === '') {
          if (result.verdict === Verdict.TimeLimitExceeded) {
            error_msg = 'Time limit exceeded when compiling';
          } else if (result.verdict === Verdict.MemoryLimitExceeded) {
            error_msg = 'Memory limit exceeded when compiling';
          } else {
            error_msg = 'Something is wrong, but, em, nothing is reported';
          }
        }
        rimraf(compile_dir, () => {});
        throw new CompileError(error_msg);
      }
    }

    // copy compile_out to exe_file
    // clear temp folder
    await promises.copyFile(path.join(compile_dir, compile_out), this.exe_file);
    await promises.chmod(this.exe_file, 0o0775);

    rimraf(compile_dir, () => {});
  }

  /**
   * Run execute under sandbox
   *
   * @param {string} work_dir
   * @param {string} [exe_file=null] null means use lang_config command
   * @param {Array<string>} [args=[]] empty means use lang_config args
   * @param {Array<{ src: string; dst: string; mode: string }>} [files=[]] map these files into sandbox, be care of access mode
   * @param {boolean} [trusted=false]
   * @param {number} max_time
   * @param {number} max_memory
   * @param {string} [stdin_file=null]
   * @param {string} [stdout_file=null]
   * @param {string} [stderr_file=null]
   * @returns {Promise<Result>}
   * @memberof Submission
   */
  async run(
    work_dir: string,
    exe_file: string = null,
    args: Array<string> = [],
    files: Array<{ src: string; dst: string; mode: string }> = [],
    trusted: boolean = false,
    max_time: number,
    max_memory: number,
    stdin_file: string = null,
    stdout_file: string = null,
    stderr_file: string = null
  ): Promise<Result> {
    const root_dir = await make_temp_dir();
    const info_dir = await make_temp_dir();
    const real_time_limit = max_time * 2;

    const uid = trusted ? COMPILER_USER_ID : RUN_USER_ID;
    const gid = trusted ? COMPILER_GROUP_ID : RUN_GROUP_ID;

    let stdin: 'ignore' | promises.FileHandle = 'ignore',
      stdout: 'ignore' | promises.FileHandle = 'ignore',
      stderr: 'ignore' | promises.FileHandle = 'ignore';

    try {
      if (stdin_file) stdin = await promises.open(stdin_file, 'r');
      if (stdout_file) stdout = await promises.open(stdout_file, 'w');
      if (stderr_file) stderr = await promises.open(stderr_file, 'w');
    } catch (err) {
      rimraf(info_dir, () => {});
      rimraf(root_dir, () => {});
      throw new TestCaseError(err.msg);
    }

    const nsjail_args = [
      '-Mo',
      '--chroot',
      root_dir,
      '--user',
      uid,
      '--group',
      gid,
      '--log',
      path.join(info_dir, 'log'),
      '--usage',
      path.join(info_dir, 'usage'),
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
      work_dir + ':/app'
    ];

    const limit_args = [
      '--cgroup_pids_max',
      64,
      '--cgroup_cpu_ms_per_sec',
      1000,
      '--cgroup_mem_max',
      (max_memory + 32) * 1024 * 1024,
      '--time_limit',
      real_time_limit + 1,
      '--rlimit_cpu',
      max_time + 1,
      '--rlimit_as',
      'inf',
      '--rlimit_stack',
      Math.max(max_memory + 32, 256),
      '--rlimit_fsize',
      OUTPUT_LIMIT
    ];

    const env_args = [];
    for (const k in ENV) {
      env_args.push('-E');
      env_args.push(`${k}=${ENV[k]}`);
    }

    const extra_files = [];
    if (exe_file === '' || exe_file === null) {
      // when exe_file has value, sub use compiler or interpreter
      // otherwise, sub will mount excutable file to sandbox
      const basename = path.basename(this.exe_file);
      extra_files.push('-R');
      extra_files.push(this.exe_file + ':/app/' + basename);
      args = args.map((s: string) =>
        String(s).replace(/({exe_file})/, basename)
      );
      exe_file = this.lang_config['execute']['cmd'].replace(
        /({exe_file})/,
        basename
      );
    }
    for (const { mode, src, dst } of files) {
      extra_files.push(mode);
      extra_files.push(src + ':/app/' + dst);
    }

    try {
      await exec(
        NSJAIL_PATH,
        [
          ...nsjail_args,
          ...extra_files,
          '-D',
          '/app',
          ...limit_args,
          ...env_args,
          '--',
          exe_file,
          ...args
        ],
        { stdio: [stdin, stdout, stderr], uid: 0, gid: 0 }
      );

      const closeTasks = [];
      if (stdin_file) closeTasks.push((stdin as promises.FileHandle).close());
      if (stdout_file) closeTasks.push((stdout as promises.FileHandle).close());
      if (stderr_file) closeTasks.push((stderr as promises.FileHandle).close());
      await Promise.all(closeTasks);

      return await usage2Result(
        info_dir,
        max_time,
        max_memory,
        real_time_limit
      );
    } catch (err) {
      console.error(err);
      throw new SystemError(err.message);
    } finally {
      rimraf(info_dir, () => {});
      rimraf(root_dir, () => {});
    }
  }
}

export default Submission;
