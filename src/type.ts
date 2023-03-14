type Expression = UnlambdaFunction | Application;

class UnlambdaFunction {
  constructor(public readonly name: string) {}

  eval(): Function {
    switch (this.name) {
      case 's':
        return (x: any) => (y: any) => (z: any) => x(z)(y(z));
      case 'k':
        return (x: any) => (_: any) => x;
      case 'i':
        return (x: any) => x;
      default:
        throw new Error(`Unknown function: ${this.name}`);
    }
  }
  toString(): string {
    return this.name;
  }
}

class Application {
  constructor(
    public readonly func: Expression,
    public readonly arg: Expression
  ) {}

  eval(): Function {
    const func = this.func.eval();
    const argVal = this.arg.eval();
    return func(argVal);
  }
  toString() {
    return `apply(${this.func}, ${this.arg})`;
  }
}

export { Expression, UnlambdaFunction, Application };
