import express from 'express';
import bodyParser from 'body-parser';
import Memcached from 'memcached';
import basicAuth from 'basic-auth';

import tokens from './configs/token';
import router from './router';

const app = express();
const cache = new Memcached('0.0.0.0:11211');

app.set('port', process.env.PORT ? process.env.PORT : 3000);

app.use(bodyParser.json());

app.use((req, res, next) => {
  // parse text/plain
  if (req.is('text/*')) {
    req.body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => (req.body += chunk));
    req.on('end', next);
  } else {
    next();
  }
});

app.all('/*', (req, res, nxt) => {
  const auth = basicAuth(req);
  if (
    auth &&
    auth.name === tokens['username'] &&
    auth.pass === tokens['password']
  ) {
    nxt();
  } else {
    res.sendStatus(401);
  }
});

app.get('/ping', (req, res) => {
  res.send('XLor Online Judge Core');
});

app.use(router);

export default app;

export { app, cache };
