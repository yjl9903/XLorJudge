import { promises } from 'fs';
import path from 'path';
import request from 'supertest';
import app from '../src/app';

describe('Ping app', () => {
  it('it should return "XLor Online Judge Core"', async () => {
    const dir = path.join(__dirname, '../src/configs/token.json');
    const token = JSON.parse(await promises.readFile(dir, 'utf8'));
    const res = await request(app)
      .get('/ping')
      .auth(token.username, token.password);
    expect(res.status).toBe(200);
    expect(res.text).toBe('XLor Online Judge Core');
  });
});
