import * as fs from 'fs';
import { evalUnlambda, parseAst } from './unlambda';

if (process.argv.length < 3) {
  console.error('Usage: node index.js <unlambda file>');
  process.exit(1);
}

const filename = process.argv[2];
const code = fs.readFileSync(filename, 'utf-8');
const ast1 = evalUnlambda(code);
const ast2 = parseAst(ast1);
console.log('CODE=', code);
console.log('AST=', ast1);
console.log('AST(mapped)=', ast2.toString());
console.log('RESULT=', ast2.eval().toString());
