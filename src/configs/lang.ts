export interface ICompileConfig {
  command: string;
  args: string[];
  out?: string;
}

export interface ILangConfig {
  sourceFileName: string;
  compile: ICompileConfig | ICompileConfig[];
  compiledExtension: string;
  execute: {
    command: string;
    args: string[];
  };
}

export const LangConfig: { [K: string]: ILangConfig } = {
  c: {
    sourceFileName: 'sub.c',
    compile: {
      command: '/usr/bin/gcc',
      args: [
        '-static',
        '-O2',
        '-std=c99',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '${compiledFile}',
        '${sourceFile}'
      ]
    },
    compiledExtension: 'bin',
    execute: {
      command: './${executableFile}',
      args: []
    }
  },
  cpp: {
    sourceFileName: 'sub.cpp',
    compile: {
      command: '/usr/bin/g++',
      args: [
        '-static',
        '-O2',
        '-std=c++11',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '${compiledFile}',
        '${sourceFile}'
      ]
    },
    compiledExtension: 'bin11',
    execute: {
      command: './${executableFile}',
      args: []
    }
  },
  cc14: {
    sourceFileName: 'sub.cpp',
    compile: {
      command: '/usr/bin/g++',
      args: [
        '-static',
        '-O2',
        '-std=c++14',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '${compiledFile}',
        '${sourceFile}'
      ]
    },
    compiledExtension: 'bin14',
    execute: {
      command: './${executableFile}',
      args: []
    }
  },
  cc17: {
    sourceFileName: 'sub.cpp',
    compile: {
      command: '/usr/bin/g++',
      args: [
        '-static',
        '-O2',
        '-std=c++17',
        '-DONLINE_JUDGE',
        '-lm',
        '-o',
        '${compiledFile}',
        '${sourceFile}'
      ]
    },
    compiledExtension: 'bin17',
    execute: {
      command: './${executableFile}',
      args: []
    }
  },
  java: {
    sourceFileName: 'Main.java',
    compile: [
      {
        command: '/usr/bin/javac',
        args: ['-encoding', 'utf8', '-d', '.', '${sourceFile}'],
        out: 'Main.class'
      },
      {
        command: '/usr/bin/jar',
        args: ['-cvf', '${compiledFile}', 'Main.class']
      }
    ],
    compiledExtension: 'jar',
    execute: {
      command: '/usr/bin/java',
      args: ['-cp', '${executableFile}', 'Main']
    }
  },
  py2: {
    sourceFileName: 'sub.py',
    compile: {
      command: '/bin/cp',
      args: ['${sourceFile}', '${compiledFile}']
    },
    compiledExtension: 'py2',
    execute: {
      command: '/usr/bin/python',
      args: ['${executableFile}']
    }
  },
  python: {
    sourceFileName: 'sub.py',
    compile: {
      command: '/bin/cp',
      args: ['${sourceFile}', '${compiledFile}']
    },
    compiledExtension: 'py3',
    execute: {
      command: '/usr/bin/python3',
      args: ['${executableFile}']
    }
  },
  text: {
    sourceFileName: 'sub.txt',
    compile: {
      command: '/bin/cp',
      args: ['${sourceFile}', '${compiledFile}']
    },
    compiledExtension: 'txt',
    execute: {
      command: '/bin/cat',
      args: ['${executableFile}']
    }
  }
};

export const LangList = Reflect.ownKeys(LangConfig);
