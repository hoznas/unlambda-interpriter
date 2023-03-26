import * as fs from 'fs';
import { parseUnlambda } from './unlambda';

if (process.argv.length < 3) {
  console.error('Usage: node index.js <unlambda file>');
  process.exit(1);
}

const filename = process.argv[2];

const code = fs.readFileSync(filename, 'utf-8');
console.log('CODE=', code);

const mappedAst = parseUnlambda(code);
console.log('AST(mapped)=', mappedAst.toString());

const result = mappedAst.eval();
console.log('RESULT=', result.toString());

const inc = (n: number): number => n + 1;
console.log('NUMBER=', result(inc)(0));
