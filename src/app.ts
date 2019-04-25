import express from 'express'
import bodyParser from 'body-parser'
import Memcached from 'memcached'

const app = express();
const cache = new Memcached('0.0.0.0:11211');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
  // parse text/plain
  if (req.is('text/*')) {
    req.body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => req.body += chunk);
    req.on('end', next);
  } else {
    next();
  }
});

export default app;

export { app, cache };