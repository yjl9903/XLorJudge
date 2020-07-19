import * as path from 'path';
import { readFileSync } from 'fs';

import { Verdict } from '../verdict';
import { Submission } from './submission';
import { Checker } from './checker';
import { Runner } from './runner';

describe('Test aplusb', () => {
  const submission = new Submission('cpp');
  const checker = new Checker('int_chk', 'cpp');
  const runner = new Runner(submission, checker, 1, 64);

  beforeAll(async () => {
    const checkerCode = readCode('chk.cpp');

    await checker.compile(checkerCode);
  });

  test('Run ac', async () => {
    await submission.compile(readCode('ac.cpp'));

    const result = await runner.run('aplusb1', { returnReport: true });

    expect(result.verdict).toBe(Verdict.Accepted);
    if ('output' in result) {
      expect(result.output).toBe('2');
      expect(result.checkerOutput).toBe(`answer is '2'`);
    } else {
      expect.assertions(0);
    }
  });

  test('Run wa', async () => {
    await submission.compile(readCode('wa.cpp'));

    const result = await runner.run('aplusb1', { returnReport: true });

    expect(result.verdict).toBe(Verdict.WrongAnswer);
  });

  test('Run RE', async () => {
    await submission.compile(readCode('re.cpp'));

    const result = await runner.run('aplusb1', { returnReport: true });

    expect(result.verdict).toBe(Verdict.RuntimeError);
  });

  test('Run MLE', async () => {
    await submission.compile(readCode('mle.cpp'));

    const result = await runner.run('aplusb1', { returnReport: true });

    expect(result.verdict).toBe(Verdict.MemoryLimitExceeded);
  });

  test('Run TLE', async () => {
    await submission.compile(readCode('tle.cpp'));

    const result = await runner.run('aplusb1', { returnReport: true });

    // Some environments may not support getting user time, and it will return IdlenessLimitExceeded.
    expect.assertions(
      Number(result.verdict === Verdict.IdlenessLimitExceeded) +
        Number(result.verdict === Verdict.TimeLimitExceeded)
    );
  });

  afterAll(async () => {
    await runner.clear();
  });

  function readCode(file: string) {
    return readFileSync(
      path.join(__dirname, `../../test/assets/aplusb/${file}`),
      'utf8'
    );
  }
});
