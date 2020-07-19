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
    const code = readCode('ac.cpp');

    await submission.compile(code);

    const result = await runner.run('aplusb1', { returnReport: true });

    expect(result.verdict).toBe(Verdict.Accepted);
    if ('output' in result) {
      expect(result.output).toBe('2');
      expect(result.checkerOutput).toBe(`answer is '2'`);
    } else {
      expect.assertions(0);
    }
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
