第２回　インタプリタを作ろう！
chatGPTと一緒に作るunlambdaインタプリタ編

今回もかなりシンプルな難解言語をtypescriptで作っていこうと思います。
今回は私よりも優秀なchatGPTさんに協力いただいてインタプリタを作っていきます。

# パーサジェネレータ
今回はパーサジェネレータを使います。
```
h-shimakawa:
パーサジェネレータとは何か説明して欲しいです。日本語の40字以内でお願いします。
```
```
chatGPT:
インタプリタを作成する際に必要なプログラムで、テキストを解析するプログラムのことです。プログラムには、与えられた文法に従ってテキストを解析し、それに基づいてプログラムを実行する機能が含まれます。これにより、プログラム開発者は、独自のプログラミング言語を開発し、簡単かつ正確にテキストを解析し、処理することができます。
```

# パーサジェネレータの選定
```
h-shimakawa:
Typescriptで使えるパーサジェネレータを教えて欲しい。あなたがお勧めする中から一番シンプルなものを紹介して。
```
```
chatGPT:
TypeScriptで使えるパーサージェネレーターとして、PEG.jsやChevrotainなどがあります。

私のおすすめは、PEG.jsです。PEG.jsはシンプルで使いやすく、文法の記述に正規表現のような簡潔な構文を使用することができます。また、自己再帰的な文法をサポートしており、JavaScriptで実装されているため、WebアプリケーションやNode.jsでの使用に適しています。(以下略)
```
PEG.jsに決定しました。

# ファイル構成
```
h-shimakawa:
typescriptとpeg.jsを使ってunlambdaのインタプリタを作りたい。ファイル構成はどうなる？
```
```
chatGPT:
TypeScriptとPeg.jsを使用してUnlambdaのインタプリタを作成するための基本的なファイル構成は以下のようになります。

/
├── src/
│   ├── index.ts              // アプリケーションのエントリーポイント
│   ├── unlambda-parser.peg   // Unlambdaのパーサー定義
│   ├── unlambda.ts           // Unlambdaインタプリタの実装
│   └── types.ts              // 型定義ファイル
├── package.json
├── tsconfig.json
└── README.md
```

# PEG.jsのインストール
```
h-shimakawa:
peg.jsをtypescriptで使いたい。peg.jsと型定義ファイルのインストール方法を教えて。なお詳しい説明は要りません。
```
```
chatGPT:
まず、peg.jsをインストールするには、次のコマンドを実行します。
npm install pegjs
次に、型定義ファイルをインストールするには、次のコマンドを実行します。
npm install @types/pegjs --save-dev
(以下略)
```

#　文法ファイルの作成
```
h-shimakawa:
このインタプリタで実装するunlambda関数はi,k,sのみです。これまでの会話を踏まえてunlambda-parser.pegを示してください。シンプルな実装を望みます。
```
```
chatGPT:
以下は、Unlambdaの関数i,k,sのみをサポートする、比較的シンプルなUnlambdaパーサーの例です。このパーサーは、Unlambdaコードをトークンに分割し、AST（抽象構文木）を生成します。このASTは、Unlambdaコードを実行するためにUnlambdaインタプリタに渡されます。

Start = Expression

Expression
  = Application
  / Variable

Application
  = "`" Expression Expression

Variable
  = "i" / "k" / "s"
```


# unlambdaのオブジェクトの定義


```
h-shimakawa:
これまでの会話に基づき次にtypes.tsを示してください。繰り返しますが、s,k,iの３関数だけ実装してください。シンプルにお願いします。なお、基本的にs,k,i,`はclassで定義してください。４つのclassにはeval()を実装してください（宣言だけでなく実装してください）
```
```
chatGPT:
type UnlambdaExpression = UnlambdaFunction | Variable | Application;

class UnlambdaFunction {
  constructor(public readonly name: string) {}

  eval(_: Function): Function {
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
}

class Variable {
  constructor(public readonly name: string) {}

  eval(arg: Function): Function {
    return arg;
  }
}

class Application {
  constructor(public readonly func: UnlambdaExpression, public readonly arg: UnlambdaExpression) {}

  eval(arg: Function): Function {
    const func = this.func.eval(arg);
    const argVal = this.arg.eval(arg);
    return func(argVal);
  }
}

export { UnlambdaExpression, UnlambdaFunction, Variable, Application };

```

# unlambda.tsの作成
```
h-shimakawa:
次にunlambda.tsを定義してください。これまでの会話（unlambda-parserおよびtype.tsの実装）を踏まえ、シンプルに実装してください
```
```
chatGPT:
以下は、Unlambdaの評価器を実装したunlambda.tsの例です。このコードは、入力の文字列をパースして、評価を行います。

typescript
Copy code
import { parse } from './unlambda-parser';

function evalUnlambda(input: string, arg: Function): Function {
  const ast = parse(input);
  return ast.eval(arg);
}

export { evalUnlambda };
```


# index.tsの作成
```
h-shimakawa:
では、これまでの実装を踏まえてシンプルにindex.tsを示してください
```
```
chatGPT:
以下は、Unlambdaインタプリタのエントリーポイントとなるindex.tsの例です。このコードは、コマンドライン引数からUnlambdaのコードを読み込み、評価を行います。

typescript
Copy code
import { evalUnlambda } from './unlambda';
import * as fs from 'fs';

if (process.argv.length < 3) {
  console.error('Usage: node index.js <unlambda file>');
  process.exit(1);
}

const filename = process.argv[2];
const code = fs.readFileSync(filename, 'utf-8');
const result = evalUnlambda(code, (x: any) => x);

console.log(result);
```

# .pegファイルのコンパイル
```
h-shimakawa:
unlambda-parser.pegのコンパイル方法を教えて
```
```
chatGPT:
コンパイルコマンドを入力します。以下のコマンドを入力してください。

npx pegjs unlambda-parser.peg
```

h-shimakawa:

chatGPT:


h-shimakawa:

chatGPT: