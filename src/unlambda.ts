const { parse } = require('./unlambda-parser');

import { Application, Expression, UnlambdaFunction } from './type';

export function parseAst(ast: any): Expression {
  if (Array.isArray(ast) && ast[0] === '`') {
    return new Application(parseAst(ast[1]), parseAst(ast[2]));
  } else if (ast === 'i') {
    return new UnlambdaFunction('i');
  } else if (ast === 'k') {
    return new UnlambdaFunction('k');
  } else if (ast === 's') {
    return new UnlambdaFunction('s');
  }
  throw new Error(`Invalid AST: ${ast}`);
}

function evalUnlambda(input: string): Function {
  const ast = parse(input);
  return ast;
}

export { evalUnlambda };
