const { writeFile } = require('fs');
const { join } = require('path');

const [node, cmd, username, password] = process.argv;

if (username === undefined || password === undefined) {
  console.log(`args: <username> <password>`);
  process.exit(0);
}

const code = `export default {
  username: '${username}',
  password: '${password}'
};\n`;

writeFile(join(__dirname, '../src/configs/token.ts'), code, () => {});
