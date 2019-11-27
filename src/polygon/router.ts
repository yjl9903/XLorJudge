import { Router } from 'express';

import { TestCase, Checker } from '../core';
import { Verdict } from '../verdict';
import { b64decode, b64encode } from '../util';

const router = Router();

router.post('/case/:id/:type', async (req, res) => {
  const {
    params: { id, type },
    body: content
  } = req;
  if (type !== 'in' && type !== 'ans') {
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
    const result = {
      verdict: Verdict.CompileError,
      message: b64encode(err.message)
    };
    if ('verdict' in err && err.verdict === Verdict.SystemError) {
      result.verdict = Verdict.SystemError;
    }
    res.status(400).send(result);
  }
});

export default router;
