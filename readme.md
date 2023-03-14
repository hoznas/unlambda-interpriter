第２回　インタプリタを作ろう！
chatGPTと一緒に作るunlambdaインタプリタ編

今回もかなりシンプルな難解言語をtypescriptで作っていこうと思います。
今回は私よりも優秀なchatGPTさんに協力いただいてインタプリタを作っていきます。

#　Unlambdaとは
```
h-shimakawa
unlambdaについて説明をしてください。日本語で１００字以内でお願いします。「チューリング完全」「難解言語」のキーワードは入れて欲しいです。
```
```
chatGPT:
Unlambdaはチューリング完全なプログラミング言語であり、関数プログラミング言語の一種です。Unlambdaは非常に簡潔で、シンプルな文法を持ち、単純な仕様に基づいて動作します。しかし、その難解な仕様ゆえに、一般的なプログラム言語とは異なる独自の書き方を必要とするため、難解言語として知られています。
```
```
h-shimakawa
unlambdaの日本語の紹介記事を2つ、unlambdaのオンラインコンパイラを、サイト名とともに紹介してください。
unlambdaの日本語の紹介記事としては、以下の2つがあります。

```
```
chatGPT:
難解プログラミング言語「unlambda」入門
（https://qiita.com/1ntegrale9/items/0b7bae8adad170ac4d02）
unlambdaというプログラミング言語について
（https://blog.kechako.com/entry/2019/03/28/002728）
unlambdaのオンラインコンパイラとしては、以下のサイトがあります。
unlambda interpreter
（https://tromp.github.io/cl/uni.html）

```



# パーサジェネレータ
今回のインタプリタ作成ではパーサジェネレータを使います。
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
後でわかるのですが、Variableは使われませんでしたね。
また、UnlambdaFunction.eval()のswitch文は修正しました。


# unlambda.tsの作成
```
h-shimakawa:
次にunlambda.tsを定義してください。これまでの会話（unlambda-parserおよびtype.tsの実装）を踏まえ、シンプルに実装してください
```
```
chatGPT:
以下は、Unlambdaの評価器を実装したunlambda.tsの例です。このコードは、入力の文字列をパースして、評価を行います。

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

# その他いろいろ聞いたこと
```
h-shimakawa:
import { parse } from './unlambda-parser'; について、以下の警告が出ます。適切に型定義する方法はありますか？なお、unlambda-parserの拡張子は.pegです。これまでの会話を踏まえたアドバイスをください。
```
```
chatGPT:
unlambda-parser.pegを読み込むための型定義ファイルunlambda-parser.d.tsを作成します。内容は以下のようにします。

declare module './unlambda-parser.peg' {
  export function parse(input: string): any;
}
index.tsなどのファイルでparse関数を呼び出すときには、以下のようにimport文を変更します。

import { parse } from './unlambda-parser.peg';
```
```
h-shimakawa:
Typescriptでprocess.argvと fs.readFileSyncを使いたい。必要なnpm installを教えて
```
```
chatGPT:
npm install --save-dev @types/node
```


```
h-shimakawa:
「``skki」をパースすると「[ '`', [ '`', [ '`', 's', 'k' ], 'k' ], 'i' ]」が帰ってきます。
ですが、type.tsで定義したオブジェクトにどうやって結びつければいいですか？コレまでの会話を踏まえて教えてください。
```
```
chatGPT:
以下はunlambda-parserから返された配列をtypes.tsで定義した型にマッピングする例です。

import { Expression, Application, UnlambdaFunction, IFunction, KFunction, SFunction } from './types';

export function parseAst(ast: any): Expression {
  if (Array.isArray(ast)) {
    switch (ast[0]) {
      case "`":
        return new Application(parseAst(ast[1]), parseAst(ast[2]));
      case "i":
        return new IFunction();
      case "k":
        return new KFunction();
      case "s":
        return new SFunction();
    }
  }

  throw new Error(`Invalid AST: ${ast}`);
}

# 実行結果
分かりにくいですが、「``skk」は「i」に同等なので、「(x) => x」（引数をそのまま返す）が帰ってきていますね。
成功です。
```
node index sample.ul
CODE= ```skki
AST= [ '`', [ '`', [ '`', 's', 'k' ], 'k' ], 'i' ]
AST(mapped)= apply(apply(apply(s, k), k), i)
RESULT= (x) => x
```


