import app from './app'
import { LANG_CONFIG } from './config'

app.get('/ping', (req, res) => {
  res.send('XLor Online Judge Core');
});

console.log(LANG_CONFIG);

const server = app.listen(3000, '0.0.0.0', () => {
  console.log("Judger is running at http://localhost:%d in %s mode", 3000, app.get("env"));
});

export default server;