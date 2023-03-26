# 第２回　インタプリタを作ろう！ 
# ChatGPTと一緒に作るUnlambdaインタプリタ編

## 今回の方針
今回のブログでは最近流行りのChatGPTを使って言語処理系を作っていこうと思います。
ソースコードもブログ原稿もなるべくChatGPTを使って描いていこうと思います。

特にソースコードについてはChatGPTの生成したものをそのまま使うよう修正は必要最小限にしています。
非効率だったり分かりにくい部分もそのまま使っていますのでご容赦ください。

##　今回のブログの進め方
今回は実験的に、私（h-shimakawa）とChatGPTの対話形式で話が進めていきます。
ChatGPTとの会話はスムーズに進むことの方が少なく、背後に何回かもやり取りを行なっています。

## 今回の言語処理系の対象言語「Unlambda」
ChatGPTに作ってもらうのはUnlambdaという関数型の難解言語です。
詳しくは以下のリンクを見てください。

- 難解プログラミング言語「unlambda」入門（https://qiita.com/1ntegrale9/items/0b7bae8adad170ac4d02）
- unlambdaというプログラミング言語について（https://blog.kechako.com/entry/2019/03/28/002728）
- unlambda interpreter(オンラインコンパイラ)（https://tromp.github.io/cl/uni.html）




#　Unlambdaとは
```
h-shimakawa
unlambdaについて説明をしてください。日本語で１００字以内でお願いします。「チューリング完全」「難解言語」のキーワードは入れて欲しいです。
```
```
ChatGPT:
Unlambdaはチューリング完全なプログラミング言語であり、関数プログラミング言語の一種です。Unlambdaは非常に簡潔で、シンプルな文法を持ち、単純な仕様に基づいて動作します。しかし、その難解な仕様ゆえに、一般的なプログラム言語とは異なる独自の書き方を必要とするため、難解言語として知られています。
```

補足：
正直難しすぎて、私にとっても訳分からんな言語です。
ですが自分でプログラミングできなくても言語仕様さえ把握できればインタプリタは簡単に作れますので皆さんもトライしてみてください。
ラムダ計算を知っている人であれば、以下のリンクを読むとわかるかもしれません。
- Math - 言語はどこまで小さくなれるか - (unlambda|iota|jot) のすすめ https://dankogai.livedoor.blog/archives/51524324.html

## 今回実装する関数
```
h-shimakawa
unlambdaのs,k,i関数のみを３カラムの表形式で示して。表は関数名、関数の働き、対応するjavascriptコードの３カラムとし、markdown形式で表示して。スタックという表現をせず、引数という言葉で説明をすること。
```

ChatGPTが生成した表:

|関数名|働き|JavaScriptコード|
|--|--|--
|s	|引数に関数を３つとり、2つ目と3つ目の引数を入れ替えた後、1つ目の引数を適用する。|	(a) => (b) => (c) => a(c)(b(c))|
|k	|2つの引数をとり、1つ目の引数を返す関数を返す。|	(a) => (_) => a|
|i	|1つの引数をとり、そのまま返す。	|(a) => a|





# パーサジェネレータ
今回のインタプリタ作成ではパーサジェネレータを使います。
```
h-shimakawa:
パーサジェネレータとは何か説明して欲しいです。日本語の40字以内でお願いします。
```
```
ChatGPT:
インタプリタを作成する際に必要なプログラムで、テキストを解析するプログラムのことです。プログラムには、与えられた文法に従ってテキストを解析し、それに基づいてプログラムを実行する機能が含まれます。これにより、プログラム開発者は、独自のプログラミング言語を開発し、簡単かつ正確にテキストを解析し、処理することができます。
```

# パーサジェネレータの選定
```
h-shimakawa:
Typescriptで使えるパーサジェネレータを教えて欲しい。あなたがお勧めする中から一番シンプルなものを紹介して。
```
```
ChatGPT:
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
ChatGPT:
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
ChatGPT:
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
ChatGPT:
以下は、Unlambdaの関数i,k,sのみをサポートする、比較的シンプルなUnlambdaパーサーの例です。このパーサーは、Unlambdaコードをトークンに分割し、AST（抽象構文木）を生成します。このASTは、Unlambdaコードを実行するためにUnlambdaインタプリタに渡されます。

Start = Expression

Expression
  = Application
  / Function

Application
  = "`" Expression Expression

Function
  = "i" / "k" / "s"
```
※Functionは元々Variable（変数）と書かれていましたが、誤解を避けるために直しています。

# unlambdaのオブジェクトの定義


```
h-shimakawa:
これまでの会話に基づき次にtypes.tsを示してください。繰り返しますが、s,k,iの３関数だけ実装してください。シンプルにお願いします。なお、基本的にs,k,i,`はclassで定義してください。４つのclassにはeval()を実装してください（宣言だけでなく実装してください）
```
```
ChatGPT:
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
※ChatGPTはVariableを実装したがりますが使いません。コードには残しますが、variableは単に無視されます。

※また、UnlambdaFunction.eval()のswitch文は修正しました。


# unlambda.tsの作成
```
h-shimakawa:
次にunlambda.tsを定義してください。これまでの会話（unlambda-parserおよびtype.tsの実装）を踏まえ、シンプルに実装してください
```
```
ChatGPT:
以下は、Unlambdaの評価器を実装したunlambda.tsの例です。このコードは、入力の文字列をパースして、評価を行います。

import { parse } from './unlambda-parser';

function evalUnlambda(input: string, arg: Function): Function {
  const ast = parse(input);
  return ast.eval(arg);
}

export { evalUnlambda };
```
```
h-shimakawa:
「``skki」をパースすると「[ '`', [ '`', [ '`', 's', 'k' ], 'k' ], 'i' ]」が帰ってきます。
ですが、type.tsで定義したオブジェクトにどうやって結びつければいいですか？コレまでの会話を踏まえて教えてください。
```
```
ChatGPT:
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
```

# index.tsの作成
```
h-shimakawa:
では、これまでの実装を踏まえてシンプルにindex.tsを示してください
```
```
ChatGPT:
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
ChatGPT:
コンパイルコマンドを入力します。以下のコマンドを入力してください。

npx pegjs unlambda-parser.peg
```

# その他いろいろ聞いたこと
```
h-shimakawa:
import { parse } from './unlambda-parser'; について、以下の警告が出ます。適切に型定義する方法はありますか？なお、unlambda-parserの拡張子は.pegです。これまでの会話を踏まえたアドバイスをください。
```
```
ChatGPT:
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
ChatGPT:
npm install --save-dev @types/node
```



# 実行結果
分かりにくいですが、「``skk」は「i」に同等なので、「(x) => x」（引数をそのまま返す）が帰ってきていますね。
成功です。
```
➜  src git:(main) ✗ tsc && node index sample.ul
CODE= ````s`ksk``s``s`ksk``s``s`ksk`ki``s``s`ksk``s``s`ksk``s``s`ksk`ki
AST= [
  '`',
  [ '`', [ '`', [Array], 'k' ], [ '`', [Array], [Array] ] ],
  [ '`', [ '`', 's', [Array] ], [ '`', [Array], [Array] ] ]
]
AST(mapped)= apply(apply(apply(apply(s, apply(k, s)), k), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(k, i)))), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(k, i)))))
RESULT= (z) => x(z)(y(z))
number= 6

```


