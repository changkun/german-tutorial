# 0.1 基础概念

对于初学者来说，空降一个从未听过的词语、句子、概念等等，是容易让人摸不着头脑。本节的目的则对那些熟悉中文（母语）和英文（第二语言）的读者，介绍一些在中、英、德这三门语言不可或缺的**自然语言基础知识**（注意，不是语法知识）。值得一提的是，我们将使用 Q&A 的形式来解释这些基础知识。

## 德语是一门什么样的语言？

德语（Deutsch）是德国、奥地利和列支敦士登的官方语言，也是瑞士、卢森堡和比利时的官方语言之一，以德语为母语的人约有九千万。

从谱系上看，德语属于印欧语系日耳曼语族的**西日耳曼语支**，英语和荷兰语是它的近亲。所以德语和英语共享大量基本词汇：

| 德语      | 英语     | 中文 |
| ------- | ------ | -- |
| Haus    | house  | 房子 |
| Buch    | book   | 书  |
| Finger  | finger | 手指 |
| Sommer  | summer | 夏天 |
| trinken | drink  | 喝  |
| kommen  | come   | 来  |
| gut     | good   | 好的 |

有些词乍一看并不像，但其实也是同源词。公元六世纪前后，德语（准确地说是高地德语）的一部分辅音发生了系统性的变化，英语则没有。对程序员来说，这就像一组字符串替换规则，掌握之后能「猜」出不少单词的意思：

| 英语    | 德语        | 例子                                            |
| ----- | --------- | --------------------------------------------- |
| p     | pf / f(f) | pound – Pfund，apple – Apfel，ship – Schiff     |
| t     | z / ss    | ten – zehn，tongue – Zunge，water – Wasser，eat – essen |
| k     | ch        | make – machen，book – Buch，milk – Milch        |
| d     | t         | day – Tag，daughter – Tochter，do – tun          |
| th    | d         | three – drei，think – denken，brother – Bruder   |

## 为什么很多人认为德语很难？

我们可以从语言类型上来回答这个问题。语言学里有两类极端：

- **屈折语**（inflectional language）：主要靠单词形态的变化来表达语法意义，比如拉丁语、俄语。
- **分析语**（analytic language）：主要靠词序和虚词来表达语法意义，单词本身几乎不变。中文就是一门典型的分析语：「狗咬人」和「人咬狗」，靠的是词序而不是词形。

英语在过去一千年里丢掉了绝大部分词形变化，已经很接近分析语了；德语则保留了相当多的屈折变化：名词有三个性、四个格，冠词和形容词要跟着名词变，动词要随人称变位。所以对于一个习惯了中文和英语的人来说，德语难就难在这些「变化」上。

但这些变化也不是白白存在的。英语的 *The dog bites the man* 和 *The man bites the dog* 意思完全相反，全靠词序区分；德语则可以靠冠词的格来区分：

- 德语：**Der** Hund beißt **den** Mann. = **Den** Mann beißt **der** Hund.
- 英语：The dog bites the man.
- 中文：狗咬了这个人。

两个德语句子的意思完全相同：der Hund 是主格，所以是狗在咬；den Mann 是宾格，所以是人被咬。正因为有格，德语的词序才能比英语更灵活。

## 句子的成分有哪些？

和中文、英语一样，一个德语句子可以拆成下面这些成分：

- **主语**（subject，Subjekt）：句子在说谁或什么。
- **谓语**（predicate，Prädikat）：主语做了什么或怎么样，核心是动词。
- **宾语**（object，Objekt）：动作的承受者。
- **表语**（predicative，Prädikativ）：跟在 sein（是）、werden（成为）这类系动词后面，说明主语是什么或怎么样，比如 Er ist **Lehrer**（他是老师）。
- **状语**（adverbial，Adverbial）：说明时间、地点、方式、原因等。
- **定语**（attribute，Attribut）：修饰名词的成分，比如形容词。

> 例子：
>
> Gestern hat der Lehrer den Schülern eine lange Geschichte erzählt.
>
> Yesterday the teacher told the pupils a long story. 昨天老师给学生们讲了一个很长的故事。
>
> 解释：gestern 是状语；hat … erzählt 是谓语；der Lehrer 是主语；den Schülern 是与格宾语；eine lange Geschichte 是宾格宾语，其中 lange 是修饰 Geschichte 的定语。至于为什么谓语被拆成了两半，那是 [0.5 词序](order.md) 一节的内容。

## 什么是主语、直接宾语、间接宾语？

> 在英语中，直接宾语和间接宾语的概念是相对的，直接宾语是谓语动作的直接承受者，间接宾语表示动作的方向或目标（通常是人）：*give **him** **a book***。间接宾语不带介词时紧跟在谓语动词之后，而且一般不能单独出现，必须有直接宾语陪着。
>
> 在德语中，语法书一般不说「直接宾语」「间接宾语」，而是按宾语的格称为**宾格宾语**（Akkusativobjekt）和**与格宾语**（Dativobjekt）。与格宾语大致相当于英语的间接宾语，有些教材也称之为「特殊宾语」（special object）。

> 例子：
>
> Ich gebe **dem Kind** **das Buch**.
>
> I give **the child** **the book**. 我把书给孩子。
>
> 解释：ich 是主语（主格），dem Kind 是与格宾语，das Buch 是宾格宾语。

德语的一些动词只带与格宾语，而没有宾格宾语，比如 helfen（帮助）：Ich helfe **dir**（我帮你）。在英语看来 *you* 是直接宾语，在德语看来 dir 却是与格。这类动词需要专门记忆，见 [3.1「与格」动词](../wordlist/dative-verbs.md)。

## 什么是名词？为什么它需要修饰？

名词是表示人、事物、地点或抽象概念的词：der Tisch（桌子）、die Stadt（城市）、die Liebe（爱）。在德语中，**名词的首字母总是大写**，这让我们在句子里一眼就能找到它们。

德语的名词有三个属性：性（gender）、数（number）和格（case）。但名词自己的词形变化很少，这些属性主要靠前面的冠词和形容词来表现。比如单看 Lehrer 这个词，我们不知道它是单数还是复数，是主语还是宾语；看到 **der** Lehrer、**den** Lehrer**n**，就全清楚了。所以在德语里，冠词和形容词不仅是对名词的修饰，更承担着标记语法信息的任务。详见 [1.1 冠词](articles.md) 和 [1.2 名词](nouns.md)。

## 什么是动词？为什么它要有变化形式？有哪些变化形式？

动词是表示动作或状态的词：gehen（走）、lesen（读）、sein（是）、wohnen（住）。

中文的动词从不变化，「我读」「他读」「我读了」「我在读」，「读」字始终如一，人称和时间靠代词、「了」「过」「着」以及时间词来交代。英语的动词有少量变化（*read – reads – reading*）。德语的动词变化则多得多，一个动词的形式同时编码了：

- **人称和数**：ich lese, du liest, er liest, wir lesen（我读，你读，他读，我们读）
- **时态**：ich lese, ich las（我读，我读过）
- **语气**：ich lese, ich läse（我读，我要是读的话）
- **语态**：ich lese, es wird gelesen（我读，它被读）

在一个句子里，带有人称和时态变化的那个动词叫做**变位动词**（finite verb，或称限定动词）。德语最重要的词序规则「动词第二位」说的就是变位动词的位置。

> 例子：
>
> Ich **habe** das Buch **gelesen**. I **have read** the book. 我读过这本书了。
>
> 解释：habe 带有人称（ich）和时态（现在时），是变位动词；gelesen 是分词，不随人称变化。

详见 [1.5 动词](verbs.md)。

## 什么是不定式？

不定式是对动词而言的。动词不定式是动词的一种不带词形变化从而不指示人称、数量、时态的形式。它叫做不定式，是因为动词不受限定，或者说不为词形变化所局限。也就是常说的动词原形（在英语中表现为：不定式 = to + 动词原形；在德语中，不定式就是动词原形，在某些结构中前面加 zu，相当于英语的 to）。不定式属于非谓语动词。

德语的不定式绝大多数以 -en 结尾，少数以 -n 结尾：lesen（读）、sagen（说）、sein（是）、tun（做）、wandern（徒步）。

- 德语：Ich kann **lesen**. / Es ist schön, Bücher **zu lesen**.
- 英语：I can **read**. / It is nice **to read** books.
- 中文：我会读。/ 读书很美好。

## 什么是时态？为什么要有时态？

**时态**（tense）表示动作发生的时间。中文没有语法上的时态，「昨天」「明天」「了」「过」这些词就够用了；英语和德语则把时间信息直接编进动词的形式里。德语有六个时态：

| 时态                        | 德语                      | 英语                             |
| ------------------------- | ----------------------- | ------------------------------ |
| 现在时 Präsens               | ich lese                | I read / I am reading          |
| 过去时 Präteritum            | ich las                 | I read / I was reading         |
| 现在完成时 Perfekt             | ich habe gelesen        | I have read / I read           |
| 过去完成时 Plusquamperfekt     | ich hatte gelesen       | I had read                     |
| 第一将来时 Futur I            | ich werde lesen         | I will read                    |
| 第二将来时 Futur II           | ich werde gelesen haben | I will have read               |

和英语不同，德语**没有进行时**：*I read* 和 *I am reading* 在德语里都是 ich lese。另外，德语日常口语中讲过去的事情多用现在完成时，讲将来的事情多用现在时加时间词，所以实际上最常用的只有现在时、现在完成时和过去时三个。详见第二部分。

和时态相关的还有两个概念：

- **语态**（voice）：主语是动作的发出者（主动语态 Aktiv）还是承受者（被动语态 Passiv）。见 [2.5 被动语态](passive.md)。
- **语气**（mood）：说话人是在陈述事实（陈述语气 Indikativ）、发出命令（命令式 Imperativ），还是在表达假设、愿望或转述（虚拟语气 Konjunktiv）。见 [2.4 虚拟语气](subjunctive.md)。

## 什么是介词？

> 在中文中，介词是虚词的一种，本身没有实在的意义，起到连接的作用，主要在名词、代词前面。比如从、自、当、于等
>
> 在英文中，介词起到关联作用，它负责把名词或相当于名词的成分与其他词关联起来，以表示前后词语之间的关系。比如 at/for/of/on/from/by/to 等
>
> 在德文中，介词用于名词或名词词组前，用来决定名词的格：宾格、与格或属格。

比如 für（为了）后面跟宾格：für **den** Chef（给老板）；mit（和，用）后面跟与格：mit **dem** Bus（坐公共汽车）；wegen（因为）后面跟属格：wegen **des** Wetters（因为天气）。所以德语的介词要连同它支配的格一起记，见 [1.4 介词](prepositions.md)。

## 什么是助动词？

**助动词**（auxiliary verb）本身不表达主要的意思，而是帮助主要动词构成时态、语态等。英语的 *have*、*be*、*will* 就是助动词。德语的助动词有三个：**haben**、**sein** 和 **werden**。

- 德语：Ich **habe** gegessen. / Er **ist** gekommen. / Ich **werde** kommen. / Das Haus **wird** gebaut.
- 英语：I have eaten. / He has come. / I will come. / The house is being built.
- 中文：我吃过了。/ 他来了。/ 我会来的。/ 房子正在建造。

## 什么是情态动词？

**情态动词**（modal verb）表达说话人对一个动作的态度：能不能、该不该、想不想、允不允许。中文的「能」「会」「要」「必须」「可以」，英语的 *can*、*must*、*may* 都是情态动词。德语的情态动词有六个：können（能）、müssen（必须）、dürfen（可以，被允许）、sollen（应该）、wollen（想要）、mögen（喜欢）。

- 德语：Ich **kann** schwimmen.
- 英语：I **can** swim.
- 中文：我**会**游泳。

注意德语句子里的主要动词 schwimmen 用不定式，而且放在句尾。详见 [1.5 动词](verbs.md)。

## 什么是副词？

**副词**（adverb）用来修饰动词、形容词或整个句子，说明时间、地点、方式、程度等：heute（今天）、hier（这里）、sehr（很）、gern（喜欢地）。

英语的形容词变副词通常要加 *-ly*（*beautiful → beautifully*），德语则不需要，绝大多数形容词可以原封不动地当副词用：

- 德语：Sie ist **schön**. / Sie singt **schön**.
- 英语：She is **beautiful**. / She sings **beautifully**.
- 中文：她很**美**。/ 她唱得很**好听**。

详见 [1.7 副词](advers.md)。

## 格是什么？主格、宾格、与格、属格分别是什么意思？

**格**（case）是名词或代词根据它在句子中的作用而发生的形态变化。英语的代词还保留着格的痕迹：*I* 作主语，*me* 作宾语，*my* 表示所属。中文则完全没有格，「我」字在什么位置都是「我」，句子成分靠词序和「把」「给」「的」等虚词来表示。

德语有四个格：

| 格          | 作用             | 提问     | 例子                                     |
| ---------- | -------------- | ------ | -------------------------------------- |
| 主格（第一格）  | 主语             | wer?   | **Der Mann** schläft.（那个男人在睡觉。）      |
| 属格（第二格）  | 所属，相当于「……的」    | wessen? | das Auto **des Mannes**（那个男人的车）       |
| 与格（第三格）  | 与格宾语，大致是「给……」「对……」 | wem?   | Ich helfe **dem Mann**.（我帮那个男人。）     |
| 宾格（第四格）  | 宾格宾语           | wen?   | Ich sehe **den Mann**.（我看见那个男人。）     |

德国的语法传统按第一格到第四格的顺序列出它们，即「主、属、与、宾」；很多面向外国人的教材则按学习的先后排成「主、宾、与、属」。两种顺序本教程都会用到，认准格的名字即可。格是德语语法的核心，详见 [1.2 名词](nouns.md)。

## 总结

本节介绍了后文会反复用到的一些基本概念：

1. 德语是西日耳曼语，和英语共享大量词汇，但比英语保留了更多的屈折变化；
2. 德语难就难在变化多：名词有性、数、格，冠词和形容词要跟着变，动词要随人称、时态变位；
3. 句子里带人称和时态变化的动词叫做变位动词；
4. 德语的宾语按格分为宾格宾语和与格宾语；
5. 德语有六个时态，没有进行时；
6. 德语有四个格：主格、属格、与格、宾格。

## 延伸阅读

以下维基百科条目可以帮助你进一步了解本节提到的概念：

- 语言：[德语](https://zh.wikipedia.org/wiki/%E5%BE%B7%E8%AF%AD)、[德语语法](https://zh.wikipedia.org/wiki/%E5%BE%B7%E8%AF%AD%E8%AF%AD%E6%B3%95)、[英语](https://zh.wikipedia.org/wiki/%E8%8B%B1%E8%AF%AD)、[英语语法](https://zh.wikipedia.org/wiki/%E8%8B%B1%E8%AA%9E%E8%AA%9E%E6%B3%95)、[日耳曼语族](https://zh.wikipedia.org/wiki/%E6%97%A5%E8%80%B3%E6%9B%BC%E8%AF%AD%E6%97%8F)
- 语言类型：[屈折语](https://zh.wikipedia.org/wiki/%E5%B1%88%E6%8A%98%E8%AF%AD)（靠词形变化来表达句子含义）、[分析语](https://zh.wikipedia.org/wiki/%E5%88%86%E6%9E%90%E8%AF%AD)（靠语序、虚词来表达句子含义）
- 构词：[词干](https://zh.wikipedia.org/wiki/%E8%A9%9E%E5%B9%B9)、[词缀](https://zh.wikipedia.org/wiki/%E8%A9%9E%E7%B6%B4)、[元音变音](https://zh.wikipedia.org/wiki/日耳曼語元音變音)
- 词类：[冠词](https://zh.wikipedia.org/wiki/%E5%86%A0%E8%AF%8D)、[代词](https://zh.wikipedia.org/wiki/%E4%BB%A3%E8%A9%9E)（人称代词、物主代词、疑问代词、不定代词）、[量词](https://zh.wikipedia.org/wiki/%E9%87%8F%E8%AF%8D)、[名词](https://zh.wikipedia.org/wiki/%E5%90%8D%E8%A9%9E)、[形容词](https://zh.wikipedia.org/wiki/%E5%BD%A2%E5%AE%B9%E8%AF%8D)（比较级、最高级）、[副词](https://zh.wikipedia.org/wiki/%E5%89%AF%E8%A9%9E)、[介词](https://zh.wikipedia.org/wiki/%E4%BB%8B%E8%A9%9E)
- 动词：[动词](https://zh.wikipedia.org/wiki/%E5%8A%A8%E8%AF%8D)、[助动词](https://zh.wikipedia.org/wiki/%E5%8A%A9%E5%8B%95%E8%A9%9E)、[情态动词](https://zh.wikipedia.org/wiki/%E6%83%85%E6%85%8B%E5%8B%95%E8%A9%9E)、[非谓语动词](https://zh.wikipedia.org/wiki/%E9%9D%9E%E9%99%90%E5%AE%9A%E5%8A%A8%E8%AF%8D)、[分词](https://zh.wikipedia.org/wiki/%E5%88%86%E8%AF%8D)、[不定式](https://zh.wikipedia.org/wiki/%E4%B8%8D%E5%AE%9A%E8%A9%9E)
- 句子成分：[主语](https://zh.wikipedia.org/wiki/%E4%B8%BB%E8%AA%9E)、[谓语](https://zh.wikipedia.org/wiki/%E8%AC%82%E8%AA%9E)、[宾语](https://zh.wikipedia.org/wiki/%E5%AE%BE%E8%AF%AD)
- 语法范畴：[时态](https://zh.wikipedia.org/wiki/%E6%97%B6%E6%80%81)、[语态](https://zh.wikipedia.org/wiki/%E8%AF%AD%E6%80%81)

[返回目录](../README.md) [下一节 0.2 发音](pronounciation.md)
