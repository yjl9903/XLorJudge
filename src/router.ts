import { Router } from 'express';

// import { cache } from './app';
import { update, query } from './cache';
import { Checker, judge, TestCase } from './core';
import { b64decode } from './util';
import { Verdict } from './verdict';

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
      res.sendStatus(500);
    }
  }
});

router.delete('/case/:id', async (req, res) => {
  const c = new TestCase(req.params.id);
  await c.clear();
  res.send({ status: 'ok' });
});

router.post('/checker', async (req, res) => {
  const code = b64decode(req.body.code);
  const chk = new Checker(req.body.id, req.body.lang);
  try {
    await chk.compile(code, 30);
    res.send({ status: 'ok' });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post('/judge', async (req, res) => {
  // cache.set(req.body.id, { verdict: Verdict.Waiting }, 3600, err => {});
  update(req.body.id, { verdict: Verdict.Waiting });
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
  // cache.get(req.query.id, (err, data) => {
  //   if (err) res.sendStatus(400);
  //   else res.send(data);
  // });
  res.send(await query(req.query.id));
});

export default router;
