import { promises, readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import { Validator } from './validtor';
import { Verdict } from '../verdict';
import { randomString, rimraf } from '../utils';
import { DATA_PATH, VAL_PATH } from '../configs';

function readCode(file: string) {
  return readFileSync(
    path.join(__dirname, `../../test/assets/aplusb/${file}`),
    'utf8'
  );
}

describe('Test Val', () => {
  const validator = new Validator('val', 'cpp');

  beforeAll(async () => {
    await rimraf(path.join(VAL_PATH, '*'));
    return validator.compile(readCode('val.cpp'));
  });

  test('Correct 1', async () => {
    const result = await validator.validate('aplusb1');
    expect(result.verdict).toBe(Verdict.Accepted);
  });

  test('Correct 2', async () => {
    const result = await validator.validate('aplusb2');
    expect(result.verdict).toBe(Verdict.Accepted);
  });

  test('Correct 3', async () => {
    const result = await validator.validate('aplusb3');
    expect(result.verdict).toBe(Verdict.Accepted);
  });

  test('Correct 4', async () => {
    const result = await validator.validate('aplusb4');
    expect(result.verdict).toBe(Verdict.Accepted);
  });

  test('Correct 5', async () => {
    const result = await validator.validate('aplusb5');
    expect(result.verdict).toBe(Verdict.Accepted);
  });

  test('Fail', async () => {
    const id = randomString(8);
    const aplusbWrong = path.join(DATA_PATH, id);
    await promises.mkdir(aplusbWrong);
    writeFileSync(path.join(aplusbWrong, 'in'), 'xysj txdy', 'utf8');
    const result = await validator.validate(id);
    expect(result.verdict).not.toBe(Verdict.Accepted);
    expect(result.message).toBe(
      'FAIL Expected integer, but "xysj" found (stdin, line 1)'
    );
    await rimraf(aplusbWrong);
  });
});
