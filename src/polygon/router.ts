import path from 'path';

import { Router } from 'express';
import multer, { diskStorage } from 'multer';

import { DATA_PATH } from '../configs';
import { TestCase, Checker, Interactor } from '../core';
import { Verdict } from '../verdict';
import { b64decode, b64encode } from '../util';

const router = Router();

router.post('/case/:id/:type', (req, res) => {
  const {
    params: { id, type }
  } = req;

  if (type !== 'in' && type !== 'ans') {
    res.sendStatus(400);
  }

  const upload = multer({
    storage: diskStorage({
      destination(req, file, nxt) {
        nxt(null, path.join(DATA_PATH, id));
      },
      filename(req, file, nxt) {
        nxt(null, id + '.' + type);
      }
    })
  }).single(type);

  upload(req, res, async err => {
    if (req.file) {
      if (err) {
        res.send({
          status: 'error',
          message: err.message
        });
      } else {
        res.send({
          status: 'ok'
        });
      }
    } else if (req.body && type in req.body) {
      const c = new TestCase(id);
      try {
        await c.write(type, req.body[type]);
        res.send({ status: 'ok' });
      } catch (err) {
        res.sendStatus(500);
      }
    } else {
      res.sendStatus(400);
    }
  });
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

router.post('/interactor', async (req, res) => {
  const code = b64decode(req.body.code);
  const int = new Interactor(req.body.id, req.body.lang);
  try {
    await int.compile(code, 30);
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
