import { Router } from 'express';

import { cache } from './app';
import { b64decode } from './util';
import { Verdict } from './type';

import Checker from './core/checker';
import judge from './core/judge';
import TestCase from './core/testcase';

const router = Router();

router.post('/case/:id/:type', async (req, res) => {
  const {
    params: { id, type },
    body: content
  } = req;
  if (type !== 'in' && type !== 'out') {
    res.sendStatus(400);
  } else {
    const c = new TestCase(id);
    try {
      await c.write(type, content);
      res.send({ status: 'ok' });
    } catch (err) {
      res.status(500).send('');
    }
  }
});

router.delete('/case/:id', async (req, res) => {
  const c = new TestCase(req.params.id);
  await c.clear();
  res.send('OK');
});

router.post('/checker', async (req, res) => {
  const code = b64decode(req.body.code);
  const chk = new Checker(req.body.id, req.body.lang);
  try {
    await chk.compile(code, 30);
    res.send({ status: 'ok' });
  } catch (err) {
    res.status(500).send('');
  }
});

router.post('/judge', async (req, res) => {
  cache.set(req.body.id, { verdict: Verdict.Waiting }, 3600, err => {});
  const code = b64decode(req.body.code);
  judge(
    req.body.id,
    code,
    req.body.lang,
    new Checker(req.body.checker.id, req.body.checker.lang),
    req.body.max_time,
    req.body.max_memory,
    req.body.cases
  ).catch(() => {});
  res.send({ status: 'ok' });
});

router.get('/query', async (req, res) => {
  cache.get(req.query.id, (err, data) => {
    if (err) res.status(400).send('');
    else res.send(data);
  });
});

export default router;
