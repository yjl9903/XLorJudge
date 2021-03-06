const LangConfig = {
  c: {
    compile: {
      cmd: '/usr/bin/gcc',
      args: [
        '-static',
        '-O2',
        '-std=c99',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '{exe_file}',
        '{code_file}'
      ]
    },
    code_file: 'foo.c',
    execute: {
      cmd: './{exe_file}',
      args: []
    },
    exe_ext: 'bin'
  },
  cpp: {
    compile: {
      cmd: '/usr/bin/g++',
      args: [
        '-static',
        '-O2',
        '-std=c++11',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '{exe_file}',
        '{code_file}'
      ]
    },
    code_file: 'foo.cpp',
    execute: {
      cmd: './{exe_file}',
      args: []
    },
    exe_ext: 'bin11'
  },
  cc14: {
    compile: {
      cmd: '/usr/bin/g++',
      args: [
        '-static',
        '-O2',
        '-std=c++14',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '{exe_file}',
        '{code_file}'
      ]
    },
    code_file: 'foo.cpp',
    execute: {
      cmd: './{exe_file}',
      args: []
    },
    exe_ext: 'bin14'
  },
  cc17: {
    compile: {
      cmd: '/usr/bin/g++',
      args: [
        '-static',
        '-O2',
        '-std=c++17',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '{exe_file}',
        '{code_file}'
      ]
    },
    code_file: 'foo.cpp',
    execute: {
      cmd: './{exe_file}',
      args: []
    },
    exe_ext: 'bin17'
  },
  java: {
    compile: {
      out: 'Main.class',
      cmd: '/usr/bin/javac',
      args: ['-encoding', 'utf8', '-d', '.', '{code_file}'],
      cmd2: '/usr/bin/jar',
      args2: ['-cvf', '{exe_file}', 'Main.class']
    },
    code_file: 'Main.java',
    execute: {
      cmd: '/usr/bin/java',
      args: ['-cp', '{exe_file}', 'Main']
    },
    exe_ext: 'jar'
  },
  py2: {
    compile: {
      cmd: '/bin/cp',
      args: ['{code_file}', '{exe_file}']
    },
    code_file: 'foo.py',
    execute: {
      cmd: '/usr/bin/python',
      args: ['{exe_file}']
    },
    exe_ext: 'py2'
  },
  python: {
    compile: {
      cmd: '/bin/cp',
      args: ['{code_file}', '{exe_file}']
    },
    code_file: 'foo.py',
    execute: {
      cmd: '/usr/bin/python3',
      args: ['{exe_file}']
    },
    exe_ext: 'py3'
  },
  text: {
    compile: {
      cmd: '/bin/cp',
      args: ['{code_file}', '{exe_file}']
    },
    code_file: 'foo.txt',
    execute: {
      cmd: '/bin/cat',
      args: ['{exe_file}']
    },
    exe_ext: 'txt'
  }
};

export default LangConfig;

const LangList = Reflect.ownKeys(LangConfig);

function checkLang(x: string) {
  for (const lang in LangConfig) {
    if (x === lang) return true;
  }
  return false;
}

export { LangConfig, LangList, checkLang };
