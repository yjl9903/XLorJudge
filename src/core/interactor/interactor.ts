import path from 'path';

import {
  INT_PATH,
  LANG_CONFIG,
  NSJAIL_PATH,
  OUTPUT_LIMIT,
  ENV,
  COMPILER_USER_ID,
  COMPILER_GROUP_ID,
  RUN_USER_ID,
  RUN_GROUP_ID
} from '../../configs';

import Submission, { SubmissionType } from '../submission';

export default class Interactor extends Submission {
  constructor(id: string, lang: string) {
    super(
      lang,
      path.join(INT_PATH, id + '.' + LANG_CONFIG[lang]['exe_ext']),
      SubmissionType.INT
    );
  }

  clear(): void {}
}

export function buildCmd(
  root_dir: string,
  info_dir: string,
  { exe_file, lang_config }: Submission,
  work_dir: string,
  args: Array<string> = [],
  files: Array<{ src: string; dst: string; mode: string }> = [],
  trusted: boolean = false,
  max_time: number,
  max_memory: number
): [string, string[]] {
  const real_time_limit = max_time * 2;

  const uid = trusted ? COMPILER_USER_ID : RUN_USER_ID;
  const gid = trusted ? COMPILER_GROUP_ID : RUN_GROUP_ID;

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

  // when exe_file has value, sub use compiler or interpreter
  // otherwise, sub will mount excutable file to sandbox
  const basename = path.basename(exe_file);
  extra_files.push('-R');
  extra_files.push(exe_file + ':/app/' + basename);
  args = args.map((s: string) => {
    return s.replace(/({exe_file})/, basename);
  });
  exe_file = lang_config['execute']['cmd'].replace(/({exe_file})/, basename);

  for (const { mode, src, dst } of files) {
    extra_files.push(mode);
    extra_files.push(src + ':/app/' + dst);
  }

  return [
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
    ]
  ];
}
