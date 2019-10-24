import express from 'express';
import bodyParser from 'body-parser';
import Memcached from 'memcached';
import basicAuth from 'basic-auth';

import * as tokens from './configs/token.json';
import router from './router';

const app = express();
const cache = new Memcached('0.0.0.0:11211');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
  if (req.url === '/ping') {
    nxt();
    return;
  }
  const auth = basicAuth(req);
  if (auth.name === tokens['username'] && auth.pass === tokens['password']) {
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
