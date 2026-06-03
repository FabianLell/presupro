const fs = require('fs');
const parser = require('@babel/parser');
const lines = fs.readFileSync('src/components/Precarga.jsx', 'utf-8').split(/\r?\n/);
const start = 572;
const end = 1393;
const code = 'function foo(){ return (\n' + lines.slice(start - 1, end).join('\n') + '\n); }\n';
try {
  parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
  console.log('PARSE_OK');
} catch (e) {
  console.error('ERR', e.message);
  if (e.loc) console.error('LOC', e.loc);
  process.exit(1);
}
