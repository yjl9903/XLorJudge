import { Router } from 'express';

import { ENABLE_POLYGON } from './configs';
import { update, query, subscribe, Msg, unsubscribe } from './cache';
import { Checker, Interactor, judge } from './core';
import { b64decode, checkJudgeField } from './util';
import { Verdict } from './verdict';
import { router as polygonRouter } from './polygon';

const router = Router();

if (ENABLE_POLYGON) {
  router.use('/', polygonRouter);
}

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
  const result = await query(req.query.id);
  if (result !== null && result !== undefined) {
    Reflect.set(result, 'status', 'ok');
    Reflect.set(result, 'id', req.query.id);
    res.send(result);
  } else {
    res.sendStatus(400);
  }
});

router.ws('/judge', (ws, req) => {
  let flag = false;
  ws.on('message', msg => {
    if (flag) return;
    try {
      const body = JSON.parse(msg.toString());
      const checkResult = checkJudgeField(body);
      if (checkResult) {
        flag = true;
        ws.send(
          JSON.stringify({
            status: 'error',
            message: checkResult
          })
        );
        return;
      }
      const fn = (msg: Msg) => {
        Reflect.set(msg, 'status', 'ok');
        Reflect.set(msg, 'id', body.id);
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
        body.checker ? new Checker(body.checker.id, body.checker.lang) : null,
        body.interactor
          ? new Interactor(body.interactor.id, body.interactor.lang)
          : null,
        body.max_time,
        body.max_memory,
        body.cases
      ).catch(() => {});
      flag = true;
    } catch (err) {
      flag = false;
      ws.send(JSON.stringify({ status: 'error' }));
    }
  });
});

export default router;
