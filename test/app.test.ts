import request from 'supertest';
import app from '../src/app';

describe('Ping app', () => {
  it('it should return "XLor Online Judge Core"', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.text).toBe('XLor Online Judge Core');
  });
});