import { Router } from 'express';

import { update, query, subscribe, Msg, unsubscribe } from './cache';
import { Checker, Interactor, judge, TestCase } from './core';
import { b64decode, checkJudgeField, b64encode } from './util';
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

router.post('/judge', async (req, res) => {
  const checkResult = checkJudgeField(req.body);
  if (checkResult) {
    res.status(400).send({
      status: 'error',
      message: checkResult
    });
    return;
  }

  update(req.body.id, { verdict: Verdict.Waiting });
  const code = b64decode(req.body.code);
  judge(
    req.body.id,
    code,
    req.body.lang,
    req.body.checker
      ? new Checker(req.body.checker.id, req.body.checker.lang)
      : null,
    req.body.interactor
      ? new Interactor(req.body.interactor.id, req.body.interactor.lang)
      : null,
    req.body.max_time,
    req.body.max_memory,
    req.body.cases
  ).catch(() => {});
  res.send({ status: 'ok' });
});

router.get('/query', async (req, res) => {
  res.send(await query(req.query.id));
});

router.ws('/judge', (ws, req) => {
  let flag = false;
  ws.on('message', msg => {
    if (flag) return;
    try {
      const body = JSON.parse(msg.toString());
      const fn = (msg: Msg) => {
        Reflect.set(msg, 'status', 'ok');
        ws.send(JSON.stringify(msg));
        if (msg.verdict > -2) {
          flag = false;
          unsubscribe(body.id, fn);
        }
      };
      subscribe(body.id, fn);
      judge(
        body.id,
        b64decode(body.code),
        body.lang,
        // new Checker(body.checker.id, body.checker.lang),
        body.checker ? new Checker(body.checker.id, body.checker.lang) : null,
        body.interactor
          ? new Interactor(body.interactor.id, body.interactor.lang)
          : null,
        body.max_time,
        body.max_memory,
        body.cases
      );
      flag = true;
    } catch (err) {
      flag = false;
      ws.send(JSON.stringify({ status: 'error' }));
    }
  });
});

export default router;
