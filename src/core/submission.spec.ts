import * as path from 'path';

import { makeTempDir, rimraf } from '../utils';
import { promises, readFileSync } from 'fs';
import { Submission } from './submission';
import { Verdict } from '../verdict';

describe('Test echo', () => {
  const submission = new Submission('text');

  let workDir = '';
  let outFile = '';
  let errFile = '';

  beforeEach(async () => {
    workDir = await makeTempDir();
    outFile = path.join(workDir, 'out');
    errFile = path.join(workDir, 'err');
    await promises.writeFile(outFile, '', 'utf8');
    await promises.writeFile(errFile, '', 'utf8');
    await promises.chmod(outFile, 0o766);
    await promises.chmod(errFile, 0o766);
  });

  test('Run echo', async () => {
    const { verdict } = await submission.run({
      workDir,
      executeCommand: '/bin/echo',
      executeArgs: ['Hello World'],
      maxTime: 10,
      maxMemory: 128,
      stdoutFile: outFile,
      stderrFile: errFile
    });
    expect(verdict).toBe(Verdict.Accepted);
    expect(readFileSync(outFile, 'utf8')).toEqual('Hello World\n');
  });

  test('Run echo123 fail', async () => {
    const { verdict } = await submission.run({
      workDir,
      executeCommand: '/bin/echo123',
      executeArgs: ['Hello World'],
      maxTime: 10,
      maxMemory: 128,
      stdoutFile: outFile,
      stderrFile: errFile
    });
    expect(verdict).toBe(Verdict.RuntimeError);
  });

  afterEach(async () => {
    if (workDir !== '') {
      await rimraf(workDir);
    }
  });
});

describe('Test Compile Cpp', () => {
  const submission = new Submission('cpp');

  test('Compile ac.cpp', async () => {
    const code = readFileSync(
      path.join(__dirname, '../../test/assets/aplusb/ac.cpp'),
      'utf8'
    );

    expect(code.length).toBeGreaterThan(0);

    await submission.compile(code);

    await submission.clear();
  });

  test('Compile ce.cpp', async () => {
    const code = readFileSync(
      path.join(__dirname, '../../test/assets/aplusb/ce.cpp'),
      'utf8'
    );

    expect(code.length).toBeGreaterThan(0);

    try {
      await submission.compile(code);
      expect.assertions(0);
    } catch (error) {
      expect.assertions(1);
    }
  });
});

describe('Test Compile Java', () => {
  const submission = new Submission('java');

  test('Compile Main.java', async () => {
    const code = readFileSync(
      path.join(__dirname, '../../test/assets/aplusb/Main.java'),
      'utf8'
    );

    expect(code.length).toBeGreaterThan(0);

    await submission.compile(code);
  });

  afterEach(async () => {
    await submission.clear();
  });
});

describe('Test Compile Python', () => {
  const submission = new Submission('python');

  test('Compile a.py', async () => {
    const code = readFileSync(
      path.join(__dirname, '../../test/assets/aplusb/a.py'),
      'utf8'
    );

    expect(code.length).toBeGreaterThan(0);

    await submission.compile(code);
  });

  afterEach(async () => {
    await submission.clear();
  });
});
