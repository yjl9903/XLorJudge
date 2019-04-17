import path from 'path'
import { promises } from 'fs'
import rimraf from 'rimraf'

import { random_string, make_temp_dir, exec } from '../util'
import { Verdict, SUB_PATH, TEMP_PATH, LANG_CONFIG, 
        COMPILER_USER_ID, COMPILER_GROUP_ID, RUN_GROUP_ID, RUN_USER_ID,
        NSJAIL_PATH, OUTPUT_LIMIT, ENV } from '../config'

import Result from './result'

class Submission {
  lang: string;
  lang_config: Object;
  exe_file: string;

  constructor(lang: string, exe_file?: string) {
    this.lang = lang;
    this.lang_config = LANG_CONFIG[lang];
    if (typeof exe_file === undefined) {
      this.exe_file = path.join(SUB_PATH, random_string());
    } else {
      this.exe_file = exe_file;
    }
  }

  clean(): void {
    try {
      // fs.rmdir(this.exe_file, (err) => {});
    } catch(ex) {

    }
  }

  async compile(code: string, max_time: number): Promise<void> {
    let compile_dir = await make_temp_dir();
    let compile_out = 'compile.out';
    let error_path = path.join(compile_dir, 'compiler.err');

    // write code into a file
    await promises.writeFile(path.join(compile_dir, this.lang_config['code_file']), code);
    
    // run compile command
    let cmd = this.lang_config['compile'].cmd;
    let args = this.lang_config['compile'].args.map((arg) => {
      if (arg === '{code_file}') arg = this.lang_config['code_file'];
      else if (arg === '{exe_file}') arg = compile_out;
      return arg;
    });
    // console.log(cmd);
    // console.log(args);

    let result = await this.run(compile_dir, cmd, args, true, max_time, 1024, null, error_path, error_path);

    console.log(result);
    // copy compile_out to exe_file
    // clear temp folder
    
  }

  // async unsafe_run(args, work_dir: string, max_time: number): Result {

  //   return new Result(0, 0, 0, Verdict.Accepted);
  // }

  async run(work_dir: string, exe_file: string = null, args: Array<string> = [], trusted: boolean = false,
      max_time: number, max_memory: number, 
      stdin_file: string = null, stdout_file: string = null, stderr_file: string = null): Promise<Result> {
    
    let root_dir = await make_temp_dir();
    let info_dir = await make_temp_dir();
    let error_path = path.join(info_dir, 'err');
    let real_time_limit = max_time * 2;

    let uid = RUN_USER_ID;
    let gid = RUN_GROUP_ID;
    if (trusted) {
      uid = COMPILER_USER_ID;
      gid = COMPILER_GROUP_ID;
    }

    let stdin: any = 'ignore', stdout: any = 'ignore', stderr: any = 'ignore';
    if (stdin_file) stdin = await promises.open(stdin_file, 'r');
    if (stdout_file) stdout = await promises.open(stdout_file, 'w');
    if (stderr_file) stderr = await promises.open(stderr_file, 'w');

    let nsjail_args = [
      '-Mo', '--chroot', root_dir, '--user', uid, '--group', gid, 
      '--log', path.join(info_dir, 'log'), '--usage', path.join(info_dir, 'usage'),
      "-R", "/bin", "-R", "/lib", "-R", "/lib64", "-R", "/usr", "-R", "/sbin", "-R", "/dev", "-R", "/etc",
      trusted ? '-B' : '-R', work_dir + ':/app', '-D', '/app'
    ];

    let limit_args = [
      "--cgroup_pids_max", 64, "--cgroup_cpu_ms_per_sec", 1000,
      "--cgroup_mem_max", (max_memory + 32) * 1024 * 1024,
      "--time_limit", real_time_limit + 1,
      "--rlimit_cpu", max_time + 1,
      "--rlimit_as", "inf",
      "--rlimit_stack", Math.max(max_memory + 32, 256),
      "--rlimit_fsize", OUTPUT_LIMIT,
    ];

    let env_args = [];
    for (let k in ENV) {
      env_args.push('-E');
      env_args.push(`${k}=${ENV[k]}`);
    }

    try {
      // console.log(NSJAIL_PATH,[...nsjail_args, ...limit_args, ...env_args, '--', exe_file, ...args]);
      let {code: _, signal: signal} = await exec(NSJAIL_PATH, 
                [...nsjail_args, ...limit_args, ...env_args, '--', exe_file, ...args], 
                { stdio: [stdin, stdout, stderr], uid: 0, gid: 0 });
    } catch(ex) {
      console.error(ex);
      throw(ex);
    }

    try {
      let usage_file = await promises.readFile(path.join(info_dir, 'usage'), 'utf8'), usage: Object = {};
      for (let line of usage_file.split('\n')) {
        if (line === '') continue;
        let [tag, num] = line.split(' ');
        usage[tag] = Number(num);
      }

      let result = new Result(Math.round(usage['user'] / 1000), Math.round(usage['memory'] / 1024), 
        usage['exit'], usage['signal']);
      if (result.exit_code != 0) {
        result.verdict = Verdict.RuntimeError;
      }
      if (max_memory > 0 && result.memory > max_memory) {
        result.verdict = Verdict.MemoryLimitExceeded;
      } else if (max_time > 0 && result.time > max_time) {
        result.verdict = Verdict.TimeLimitExceeded;
      } else if (real_time_limit > 0 && usage['pass'] / 1000 > real_time_limit) {
        result.verdict = Verdict.IdlenessLimitExceeded;
      } else if (result.signal !== 0) {
        result.verdict = Verdict.RuntimeError;
      }
      return result;
    } catch(ex) {
      console.error(ex);
      throw(ex);
    } finally {
      rimraf(info_dir, () => {});
      rimraf(root_dir, () => {});
    }
  }
}

export default Submission;
