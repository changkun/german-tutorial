# 1.6 形容词

形容词是那些用来描写、描述或修饰人和事物名词的单词。

## 形容词词尾变化

德语中，如果形容词不直接修饰名词，而是作表语用在 sein、werden、bleiben 等动词之后（Der Wein ist trocken. 这酒是干型的），或者作副词使用，则它们的使用最简单，因为它们保持基本形态，不改变词尾。

不过，如果形容词放在名词前面，变化就有点复杂了。这时候形容词带有不同的词尾：形容词必须变格。

这时候的形容词词尾由以下因素决定：

- 形容词前的冠词及其词尾；
- 形容词后面名词的性质（性、数、格三个方面）。

除此之外，还有两个规则：

- 如果形容词前面的冠词词尾变化，则形容词词尾为 -e 或者 -en
- 如果形容词前的冠词没有变化词尾或没有冠词，形容词就要自己承担起标记性、数、格的任务，带上和定冠词相似的词尾（der Wein → trocken**er** Wein）

背后的道理其实很简单：名词的性、数、格信息，**必须且只需**由冠词或形容词中的一个来标记。冠词已经标记了，形容词就「偷懒」，只用 -e 或 -en；冠词没有标记，形容词就得自己扛起来。用程序员的话说：

```
if 冠词带有能标明性、数、格的词尾:   # der/die/das, dieser, 以及带词尾的 ein/mein ...
    形容词用弱词尾 -e / -en
else:                              # 没有冠词，或 ein/kein/mein 这类没有词尾的情况
    形容词用强词尾，即和定冠词相同的词尾 -er / -e / -es / -en / -em ...
```

根据冠词的不同，形容词的变格分为三种，下面以 der Wein（阳性）、die Suppe（阴性）、das Bier（中性）和 die Weine（复数）为例。

**弱变化**：在定冠词和 dieser、jeder、welcher 等 der 类词之后。

|    | 阳性                | 阴性                 | 中性                 | 复数                  |
| -- | ----------------- | ------------------ | ------------------ | ------------------- |
| 主格 | der gut**e** Wein  | die gut**e** Suppe  | das gut**e** Bier  | die gut**en** Weine  |
| 宾格 | den gut**en** Wein | die gut**e** Suppe  | das gut**e** Bier  | die gut**en** Weine  |
| 与格 | dem gut**en** Wein | der gut**en** Suppe | dem gut**en** Bier | den gut**en** Weinen |
| 属格 | des gut**en** Weins | der gut**en** Suppe | des gut**en** Biers | der gut**en** Weine  |

弱变化只有两个词尾：单数主格和阴性、中性单数宾格这五个位置是 -e，其余全是 -en。

**混合变化**：在不定冠词 ein、kein 和物主冠词 mein、dein 等 ein 类词之后。

|    | 阳性                  | 阴性                   | 中性                   | 复数                    |
| -- | ------------------- | -------------------- | -------------------- | --------------------- |
| 主格 | ein gut**er** Wein   | eine gut**e** Suppe   | ein gut**es** Bier   | keine gut**en** Weine  |
| 宾格 | einen gut**en** Wein | eine gut**e** Suppe   | ein gut**es** Bier   | keine gut**en** Weine  |
| 与格 | einem gut**en** Wein | einer gut**en** Suppe | einem gut**en** Bier | keinen gut**en** Weinen |
| 属格 | eines gut**en** Weins | einer gut**en** Suppe | eines gut**en** Biers | keiner gut**en** Weine  |

混合变化和弱变化几乎完全一样，只有三个位置不同：阳性主格 -er、中性主格和中性宾格 -es。这正是 [1.1 冠词](articles.md) 中提到的 ein 没有词尾的三个「空位」，形容词在这里必须补上强词尾。

**强变化**：前面没有冠词时。

|    | 阳性            | 阴性             | 中性            | 复数              |
| -- | ------------- | -------------- | ------------- | --------------- |
| 主格 | gut**er** Wein | gut**e** Suppe  | gut**es** Bier | gut**e** Weine   |
| 宾格 | gut**en** Wein | gut**e** Suppe  | gut**es** Bier | gut**e** Weine   |
| 与格 | gut**em** Wein | gut**er** Suppe | gut**em** Bier | gut**en** Weinen |
| 属格 | gut**en** Weins | gut**er** Suppe | gut**en** Biers | gut**er** Weine  |

从表格中可以看出，强变化的词尾和定冠词的词尾（der, die, das, den, dem, des …）一一对应。

> 不带冠词的二格阳性和中性词尾是特例。不同于一般情况下的词尾，他们是以 -en 结尾的。名词带有二格词尾。不过这种形式不常见。

> 例子：
>
> Ich trinke gern **kalten** Kaffee mit **frischer** Milch.
>
> I like drinking cold coffee with fresh milk. 我喜欢喝加了新鲜牛奶的冰咖啡。
>
> 解释：没有冠词，用强变化。Kaffee 是阳性宾格，词尾 -en（对应 den）；Milch 是阴性与格，词尾 -er（对应 der）。

还有几个小规则：

- lila 和 rosa 这两个形容词不变格：ein lila Kleid（一条紫色的裙子）。由城市名加 -er 构成的形容词也不变格：das Berliner Bier，der Münchner Flughafen。
- 以 -el 结尾的形容词变格时去掉 e：dunkel → eine dunkle Nacht（一个黑夜）。以 -er 结尾的形容词常常也去掉 e：teuer → ein teures Auto（一辆贵的车）。
- hoch 变格时变成 hoh-：Das Haus ist hoch → ein hohes Haus（一座高楼）。
- 形容词作名词时（见 [0.4 构词](formation.md)），词尾也照样变化：der Deutsche（定冠词，弱变化），ein Deutscher（不定冠词，混合变化）。


## 形容词比较级和最高级

当事物需要进行对比时，我们就需要用到形容词的原级、比较级和最高级了。

- 原级：形容词的基本形式
- 比较级：+ er
- 最高级：作表语或副词时为 am + -(e)sten，作定语时为 -(e)st- + 形容词词尾

形容词的比较级和最高级什么时候要有形容词词尾，什么时候没有呢？这里适用一般的变格规则：

- 如果形容词作表语或副词，则不需要变化；
- 如果形容词在名词之前，则需要变格。

三种形式（原级、比较级和最高级）都可以作定语或表语。作定语时，词尾都遵循相同的规则。

- 不过也有一两种特例。如果形容词以 -d, -s, -ss, -ß, -sch, -t, -tz, -x 或者 -z 结尾，最高级要加 -est 而不是 -st，以便发音：alt → am ältesten，kurz → am kürzesten，heiß → am heißesten。例外是 groß → am größten。
- 很多单音节形容词的 a, o, u 在比较级和最高级中要变成 ä, ö, ü：alt → älter，groß → größer，jung → jünger；
- 其他不规则变化有：

| 原级   | 比较级    | 最高级           | 英语                     |
| ---- | ------ | ------------- | ---------------------- |
| gut  | besser | am besten     | good – better – best   |
| viel | mehr   | am meisten    | much – more – most     |
| gern | lieber | am liebsten   | gladly – rather – most of all |
| hoch | höher  | am höchsten   | high – higher – highest |
| nah  | näher  | am nächsten   | near – nearer – nearest |

可以看出，最不规则的那几个，英语和德语恰好一模一样不规则。gern 其实是副词，Ich trinke **gern** Tee / **lieber** Kaffee / **am liebsten** Wasser 的意思是「我喜欢喝茶 / 更喜欢喝咖啡 / 最喜欢喝水」，非常常用。

下面是规则变化的几个例子：

| 原级      | 比较级       | 最高级              |
| ------- | --------- | ---------------- |
| schnell | schneller | am schnellsten   |
| klein   | kleiner   | am kleinsten     |
| alt     | älter     | am ältesten      |
| jung    | jünger    | am jüngsten      |
| groß    | größer    | am größten       |
| teuer   | teurer    | am teuersten     |

注意德语的比较级和最高级一律在词尾变化，不像英语那样对长单词用 *more* 和 *most*：interessant → interessanter → am interessantesten（*interesting → more interesting → most interesting*）。

### 比较的句式

- **so + 原级 + wie**，表示「和……一样」：Er ist **so groß wie** ich.（他和我一样高。）
- **比较级 + als**，表示「比……更」：Er ist **größer als** ich.（他比我高。）

注意比较级后面用 als，不用 wie。als 和 wie 后面的名词或代词与前面被比较的部分用同一个格，这里的 ich 是主格，因为它和主语 er 相比。

### 作定语的比较级和最高级

比较级和最高级放在名词前面时，和原级一样要加形容词词尾：

- Ich suche eine **größere** Wohnung.（我在找一套更大的房子。）
- Das ist der **schnellste** Zug.（这是最快的火车。）

作表语时，最高级既可以用 am -sten，也可以用「定冠词 + 最高级 + 词尾」：Dieser Zug ist **am schnellsten**. = Dieser Zug ist **der schnellste**.（这列火车最快。）

mehr（更多）和 weniger（更少）永远不变格：Ich brauche **mehr** Zeit.（我需要更多时间。）

## 分词作形容词

动词的两种分词都可以作形容词使用，放在名词前面时同样要加形容词词尾：

- **第一分词**（现在分词）= 不定式 + -d，表示主动、正在进行，相当于英语的 *-ing*：das schlafen**d**e Kind（正在睡觉的孩子），kommen**d**e Woche（下周）。
- **第二分词**（过去分词），表示被动、已经完成，相当于英语的 *-ed*：das gekocht**e** Ei（煮熟的鸡蛋），ein geöffnet**es** Fenster（一扇打开的窗户）。

第二分词的构成见 [2.2 过去时](past.md)。

## 总结

1. 形容词作表语或副词时不变化，作定语放在名词前面时要变格；
2. 冠词已经标明了性、数、格时，形容词用弱词尾 -e/-en；冠词没有标明时，形容词用和定冠词相同的强词尾；
3. 因此形容词变格分为三种：定冠词之后的弱变化、ein 类词之后的混合变化、没有冠词时的强变化；
4. 比较级加 -er，最高级为 am -(e)sten，单音节形容词的 a、o、u 常常变音；gut、viel、gern、hoch、nah 不规则变化；
5. 「一样」用 so … wie，「比……更」用比较级 + als；
6. 分词也可以作形容词使用，第一分词表示主动，第二分词表示被动或完成。

## 练习

1. 填入形容词词尾：der klein___ Hund / ein klein___ Hund / mit einem klein___ Hund / klein___ Hunde（复数，没有冠词）/ das neu___ Auto / ein neu___ Auto
2. 填入形容词词尾：Ich trinke kalt___ Wasser.（das Wasser）/ Kaffee mit frisch___ Milch（die Milch）
3. 写出比较级和最高级：alt、gut、viel、groß
4. 填入 als 或 wie：Er ist so alt ___ ich. / Sie ist älter ___ ich.

<details>
<summary>答案</summary>

1. der kleine Hund（弱变化），ein kleiner Hund（混合变化，ein 没有词尾），mit einem kleinen Hund，kleine Hunde（强变化），das neue Auto，ein neues Auto（ein 没有词尾）。
2. kaltes（强变化，中性宾格，对应 das），frischer（强变化，阴性与格，对应 der）。
3. älter, am ältesten；besser, am besten；mehr, am meisten；größer, am größten。
4. wie, als。

</details>

[返回目录](../README.md) [上一节 1.5 动词](verbs.md) [下一节 1.7 副词](advers.md)