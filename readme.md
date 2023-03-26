# 第２回　インタプリタを作ろう！
# ChatGPTと一緒に作るUnlambdaインタプリタ編

## 今回の方針
今回のブログでは最近流行りのChatGPTを使って言語処理系を作っていこうと思います。
ソースコードもブログ原稿もなるべくChatGPTを使って描いていこうと思います。

特にソースコードについてはChatGPTの生成したものをそのまま使うよう修正は必要最小限にしています。
非効率だったり分かりにくい部分もそのまま使っていますのでご容赦ください。

## 今回のブログの進め方
今回は実験的に、私（h-shimakawa）とChatGPTの対話形式で話が進めていきます。
ChatGPTとの会話はスムーズに進むことの方が少なく、背後に何回かもやり取りを行なっています。

なお、今回はパーサジェネレータ(後述)を使用しますので、Typescript(Javascript)でのコーディングが前提となっています。

## 今回の言語処理系の対象言語「Unlambda」
ChatGPTに作ってもらうのはUnlambdaという関数型の難解言語です。
詳しくは以下のリンクを見てください。

- 難解プログラミング言語「unlambda」入門  https://qiita.com/1ntegrale9/items/0b7bae8adad170ac4d02
- unlambdaというプログラミング言語について  https://blog.kechako.com/entry/2019/03/28/002728
- unlambda interpreter(オンラインコンパイラ)  https://tromp.github.io/cl/uni.html


## Unlambdaとは

>h-shimakawa:<br>
unlambdaについて説明をしてください。日本語で１００字以内でお願いします。「チューリング完全」「難解言語」のキーワードは入れて欲しいです。


>ChatGPT:<br>
Unlambdaはチューリング完全なプログラミング言語であり、関数プログラミング言語の一種です。Unlambdaは非常に簡潔で、シンプルな文法を持ち、単純な仕様に基づいて動作します。しかし、その難解な仕様ゆえに、一般的なプログラム言語とは異なる独自の書き方を必要とするため、難解言語として知られています。


#### 補足：
正直難しすぎて、私にとってもUnlambdaはワケわからんな言語です。

ですが自分でプログラミングできなくても言語仕様さえ把握できればインタプリタは簡単に作れますので皆さんもトライしてみてください。

ラムダ計算を知っている人であれば、以下のリンクを読むとわかるかもしれません。
- Math - 言語はどこまで小さくなれるか - (unlambda|iota|jot) のすすめ https://dankogai.livedoor.blog/archives/51524324.html

## 今回実装する機能
>h-shimakawa:<br>
unlambdaのs,k,i関数のみを３カラムの表形式で示して。表は関数名、関数の働き、対応するjavascriptコードの３カラムとし、markdown形式で表示して。スタックという表現をせず、引数という言葉で説明をすること。

ChatGPTが生成した表:
|関数名|働き|JavaScriptコード|
|--|--|--
|s	|引数に関数を３つとり、2つ目と3つ目の引数を入れ替えた後、1つ目の引数を適用する。|	(a) => (b) => (c) => a(c)(b(c))|
|k	|2つの引数をとり、1つ目の引数を返す関数を返す。|	(a) => (_) => a|
|i	|1つの引数をとり、そのまま返す。	|(a) => a|


## パーサジェネレータ
今回のインタプリタ作成ではパーサジェネレータを使います。
>h-shimakawa:<br>
パーサジェネレータとは何か説明して欲しいです。日本語の40字以内でお願いします。

>ChatGPT:<br>
インタプリタを作成する際に必要なプログラムで、テキストを解析するプログラムのことです。プログラムには、与えられた文法に従ってテキストを解析し、それに基づいてプログラムを実行する機能が含まれます。これにより、プログラム開発者は、独自のプログラミング言語を開発し、簡単かつ正確にテキストを解析し、処理することができます。

## パーサジェネレータの選定

>h-shimakawa:<br>
Typescriptで使えるパーサジェネレータを教えて欲しい。あなたがお勧めする中から一番シンプルなものを紹介して。

>ChatGPT:<br>
TypeScriptで使えるパーサージェネレーターとして、PEG.jsやChevrotainなどがあります。<br>
私のおすすめは、PEG.jsです。PEG.jsはシンプルで使いやすく、文法の記述に正規表現のような簡潔な構文を使用することができます。また、自己再帰的な文法をサポートしており、JavaScriptで実装されているため、WebアプリケーションやNode.jsでの使用に適しています。(以下略)

## ファイル構成
>h-shimakawa:<br>
typescriptとpeg.jsを使ってunlambdaのインタプリタを作りたい。ファイル構成はどうなる？

>ChatGPT:<br>
TypeScriptとPeg.jsを使用してUnlambdaのインタプリタを作成するための基本的なファイル構成は以下のようになります。
```
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

前回のブログでは
BNF、Tokenizer、Parser、Evaluatorの順にファイルを作ってきましたが、
今回はファイル分割がぐちゃぐちゃになってしまいました。
一応関数単位では分かれていますので、以下をご覧ください。

|区分|ファイル|関数|
|--|--|--|
|BNF|unlambda-parser.peg|ファイル全体|
|Tokenizer|unlambda-parser.peg|ファイル全体|
|Parser|unlambda-parser.peg<br>unlambda.ts|ファイル全体<br>parseAst()|
|Evaluator|unlambda.ts|evalUnlambda()|
|型定義|types.ts|ファイル全体|
|エントリーポイント|index.ts|ファイル全体｜



## PEG.jsのインストール
>h-shimakawa:<br>
peg.jsをtypescriptで使いたい。peg.jsと型定義ファイルのインストール方法を教えて。なお詳しい説明は要りません。

>ChatGPT:<br>
まず、peg.jsをインストールするには、次のコマンドを実行します。<br>
npm install pegjs<br>
次に、型定義ファイルをインストールするには、次のコマンドを実行します。<br>
npm install @types/pegjs --save-dev<br>
(以下略)


##　文法ファイルの作成(BNF/Tokenizer/Parser)
>h-shimakawa:<br>
このインタプリタで実装するunlambda関数はi,k,sのみです。これまでの会話を踏まえてunlambda-parser.pegを示してください。シンプルな実装を望みます。

>ChatGPT:<br>
以下は、Unlambdaの関数i,k,sのみをサポートする、比較的シンプルなUnlambdaパーサーの例です。このパーサーは、Unlambdaコードをトークンに分割し、AST（抽象構文木）を生成します。このASTは、Unlambdaコードを実行するためにUnlambdaインタプリタに渡されます。
```
Start = Expression

Expression
  = Application
  / Function

Application
  = "`" Expression Expression

Function
  = "i" / "k" / "s"
```
※ これは文法を定義するファイルで、前回作成したBNFと同じような意味があります。<br>
※ Functionは元々Variable（変数）と書かれていましたが、誤解を避けるために直しています。

### .pegファイルのコンパイル

>h-shimakawa:<br>
unlambda-parser.pegのコンパイル方法を教えて

>ChatGPT:<br>
コンパイルコマンドを入力します。以下のコマンドを入力してください。<br>
<br>
npx pegjs unlambda-parser.peg


>h-shimakawa:<br>
import { parse } from './unlambda-parser'; について、型定義がないため警告が出ます。適切に型定義する方法はありますか？なお、unlambda-parserの拡張子は.pegです。これまでの会話を踏まえたアドバイスをください。

>ChatGPT:<br>
unlambda-parser.pegを読み込むための型定義ファイルunlambda-parser.d.tsを作成します。内容は以下のようにします。<br>
declare module './unlambda-parser.peg' {<br>
  export function parse(input: string): any;<br>
}<br>
index.tsなどのファイルでparse関数を呼び出すときには、以下のようにimport文を変更します。<br>
import { parse } from './unlambda-parser.peg';


## unlambdaのオブジェクトの定義
>h-shimakawa:<br>
これまでの会話に基づき次にtypes.tsを示してください。繰り返しますが、s,k,iの３関数だけ実装してください。シンプルにお願いします。なお、基本的にs,k,i,`はclassで定義してください。４つのclassにはeval()を実装してください（宣言だけでなく実装してください）

ChatGPTの生成したコード
```
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



## unlambda.tsの作成(Parser)
>h-shimakawa:<br>
次にunlambda.tsを定義してください。これまでの会話（unlambda-parserおよびtype.tsの実装）を踏まえ、シンプルに実装してください

>ChatGPT:<br>
以下は、Unlambdaの評価器を実装したunlambda.tsの例です。このコードは、入力の文字列をパースして、評価を行います。

```
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
```
※ ここのコード生成は何回か問い合わせをした上で、コードを自分でまとめる必要がありました。

## Unlambdaテストコードの作成
evaluatorに相当するindex.tsを書く前にテストコードを作成します。
テストコードを先に書いた方が、メイン処理の理解がいくらか簡単になります。

### チャーチ数
Unlambdaのテストコードを何回もChatGPTにお願いをしたのですが、
Unlambdaの文法にさえ合わないコードしか生成できませんでしたので、自分で調べてコードを書く必要がありました。<br>
そこで、Unlambdaのテストコードはチャーチ数で2 * 3の計算を行いたいと思います。

まずは、再掲となりますが、Math - 言語はどこまで小さくなれるか - (unlambda|iota|jot) のすすめhttps://dankogai.livedoor.blog/archives/51524324.html を参考に、以下のようにチャーチ数を整理しました。

|合成した関数名|Unlambdaコード|対応するJavascriptコード|
|--|--|--|
|zero<br>(bottom)| \`ki          | (_) => iに相当|
|succ| \`s\`\`s\`ksk    | (f)=>(n)=>f(n)に相当|
|one| \` \`s\`\`s\`ksk \`ki | succ(zero)、(f)=>(n)=>f(n)に相当 |
|two| \` \`s\`\`s\`ksk \` \`s\`\`s\`ksk \`ki | succ(succ(zero))、(f)=>(n)=>f(f(n))に相当 |
|three| \` \`s\`\`s\`ksk \` \`s\`\`s\`ksk \` \`s\`\`s\`ksk \`ki | succ(succ(succ(zero)))、(f)=>(n)=>f(f(f(n)))に相当|
|mul| \`\`s\`ksk | (a)=>(b)=>ab 掛け算に相当(abはa*bの結果を表すチャーチ数)|

すると2 * 3は以下のようになります。
```
2 * 3 = mul(two)(three)
      = mul(succ(succ(zero)))(succ(succ(succ(zero))))
      = `` mul
             `succ `succ zero
             `succ `succ `succ zero
      = `` ``s`ksk
             ` `s``s`ksk ` `s``s`ksk `ki
             ` `s``s`ksk ` `s``s`ksk ` `s``s`ksk `ki
      = ````s`ksk``s``s`ksk``s``s`ksk`ki``s``s`ksk``s``s`ksk``s``s`ksk`ki
```
なので、テストコードは以下のようになります。sample.ulとして保存してください。

一つ注意点があります。<br>
peg.jsのところを見て欲しいのですが、空白文字が文法に組み込まれていません。
ですので本プログラムは一切のスペース、タブ、改行を許容しませんので、サンプルコードを保存するときは気をつけてください。
もちろん、間違って空白文字やその他の文字を含んだときは文法エラーが表示されるはずです。
```
 ````s`ksk``s``s`ksk``s``s`ksk`ki``s``s`ksk``s``s`ksk``s``s`ksk`ki
```



# index.tsの作成
>h-shimakawa:<br>
では、これまでの実装を踏まえてシンプルにindex.tsを示してください

>ChatGPT:<br>
以下は、Unlambdaインタプリタのエントリーポイントとなるindex.tsの例です。このコードは、コマンドライン引数からUnlambdaのコードを読み込み、評価を行います。

```
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
```

最後の方に追記した、数値化するコードについて補足説明をします。

先ほど作成したテストコードは、2*3に相当するUnlambdaコードでしたね。
掛け算を実行した計算結果(6)がチャーチ数として返ってきます。

6に相当するチャーチ数は、(f)=>(n)=>f(f(f(f(f(f(n))))))に相当するコードになっているはずです。
このとき、fにincを、nに0を与えるとどうなるでしょうか？

```
six = (f)=>(n)=>f(f(f(f(f(f(n))))))
inc = (n)=>n+1

six(inc)(0) = ((f)=>(n)=>f(f(f(f(f(f(n)))))))(inc)(0)   // sixを展開
            = ((n)=>inc(inc(inc(inc(inc(inc(n)))))))(0) // fにincを適用
            = ((n)=>n+1+1+1+1+1+1)(0)                   // incを展開
            = 0+1+1+1+1+1+1                             // nに0を適用
            = 6
```


# 実行

```
$ npm install --save-dev @types/node # process.argvとfs.readFileSyncのため
$ npx pegjs unlambda-parser.peg # .pegのコンパイル
$ tsc
$ node index sample.ul
CODE= ````s`ksk``s``s`ksk``s``s`ksk`ki``s``s`ksk``s``s`ksk``s``s`ksk`ki
AST(mapped)= apply(apply(apply(apply(s, apply(k, s)), k), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(k, i)))), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(apply(s, apply(apply(s, apply(k, s)), k)), apply(k, i)))))
RESULT= (z) => x(z)(y(z))
NUMBER= 6
```
RESULTの出力がs関数の中に隠れてしまって、なんだか分からなくなってしまっていますが、
ちゃんとNUMBERに6が表示されていますね。
大成功です！


## Unlambdaインタプリタを作ってみて
- Unlambdaは、前回のBrainf*ckよりもさらに命令数が少ない言語ですが、どちらもチューリング完全な能力を持っています。
- 自分でUnlambdaのプログラミングできなくても、言語仕様が分かればインタプリタを作ることができます。
- PEG.jsのようなパーサジェネレータを使えばBNFのような文法ファイルを作成するだけでTokenizerやParserの機能を自動で生成してくれます。

## ChatGPTについて
- 今回はChatGPTをフルに使ってコードを書きました。
- ChatGPTによる







