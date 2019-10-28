import request from 'supertest';

import app from '../src/app';
import { closeRedis } from '../src/cache';
import token from '../src/configs/token';

describe('Ping app', () => {
  it('it should return "XLor Online Judge Core"', async () => {
    const res = await request(app)
      .get('/ping')
      .auth(token.username, token.password);
    expect(res.status).toBe(200);
    expect(res.text).toBe('XLor Online Judge Core');
  });
});

afterAll(closeRedis);
