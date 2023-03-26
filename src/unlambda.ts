import { Application, Expression, UnlambdaFunction } from './type';
const { parse } = require('./unlambda-parser');

export const parseUnlambda = (code: string): Expression => {
  const simpleAst = parse(code);

  const mappedAst = mapAst(simpleAst);

  return mappedAst;
};

function mapAst(ast: any): Expression {
  if (Array.isArray(ast) && ast[0] === '`') {
    return new Application(mapAst(ast[1]), mapAst(ast[2]));
  } else if (ast === 'i') {
    return new UnlambdaFunction('i');
  } else if (ast === 'k') {
    return new UnlambdaFunction('k');
  } else if (ast === 's') {
    return new UnlambdaFunction('s');
  }
  throw new Error(`Invalid AST: ${ast}`);
}
