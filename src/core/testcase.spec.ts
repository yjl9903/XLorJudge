import { readFileSync } from 'fs';
import * as path from 'path';
import { randomString, rimraf } from '../utils';
import { Generator } from './generator';
import { TestCase } from './testcase';
import { GEN_PATH } from '../configs';
import { Verdict } from '../verdict';

function readCode(file: string) {
  return readFileSync(
    path.join(__dirname, `../../test/assets/aplusb/${file}`),
    'utf8'
  );
}

jest.setTimeout(20 * 1000);

describe('Testcase', () => {
  const generatorIn = new Generator('gen', 'cpp');
  const generatorAns = new Generator('std', 'cpp');
  const testcase = new TestCase(randomString(8));

  beforeAll(async () => {
    await rimraf(path.join(GEN_PATH, '*'));
    await generatorIn.compile(readCode('gen.cpp'));
    return generatorAns.compile(readCode('ac.cpp'));
  });

  test('Gen', async () => {
    const a = Math.floor(Math.random() * 100);
    const b = Math.floor(Math.random() * 100);

    const resultIn = await testcase.genIn(generatorIn, [String(a), String(b)]);
    expect(resultIn.verdict).toBe(Verdict.Accepted);
    expect(readFileSync(testcase.inputFile, 'utf8').trim()).toMatch(
      `${a} ${b}`
    );

    const resultAns = await testcase.genAns(generatorAns);
    expect(resultAns.verdict).toBe(Verdict.Accepted);
    expect(readFileSync(testcase.answerFile, 'utf8').trim()).toMatch(
      `${a + b}`
    );
  });

  afterAll(async () => {
    await testcase.clear();
  });
});
