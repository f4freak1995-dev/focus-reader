# Focus Reader 数据来源与使用说明

这里的开放资源不是统一的无版权公版。辞典原条目与候选时间、个人状态分开存储。应用代码的自行编写不改变第三方数据许可。

## 教育部辞典

来源：台湾教育部《重編國語辭典修訂本》（2015，资料更新 20260929），163,909 条来源记录；《成語典》（2020，资料更新 20260929），5,489 条来源记录，其中主条 1,664 条。

- 下载入口：<https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/index.html>
- 修订本原文件：<https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/download/dict_revised_2015_20260929.zip>
- 成语典原文件：<https://language.moe.gov.tw/001/Upload/Files/site_content/M0001/respub/download/dict_idioms_2020_20260929.zip>
- 授权：CC BY-ND 3.0 Taiwan，<https://creativecommons.org/licenses/by-nd/3.0/tw/>

完整官方使用说明随本客户端保留为 `moe-revised-usage.pdf` 和 `moe-idioms-usage.pdf`。版本、原始繁体条目及全部原始字段存放在 `chinese-research.sqlite3` 的 `dictionary_entries.original_json`。本应用不修改其释义，不把其内容转成简体。简体查询通过 CC-CEDICT 自己的词形对应寻找原始繁体词条，显示原文。辞典中的释义可能包含原始排版标记；本版以文字显示，完整记录仍保留。

## CC-CEDICT

CC-CEDICT 编辑者及贡献者；下载日期 2026-10-05，125,193 条来源记录。

- 项目：<https://cc-cedict.org/>
- 下载：<https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz>
- 授权：CC BY-SA 4.0，<https://creativecommons.org/licenses/by-sa/4.0/>

原始词形、拼音、英语释义、原行和文件头存入 `dictionary_entries.original_json` / `sources`。SQLite 转存和成语查询形式索引属于存储与索引处理，不改写释义；与 CC-CEDICT 有关的改编/索引保留 CC BY-SA 4.0 条件。英语释义不是在线翻译。本客户端的中文 ARSVP 模式不表示英文自适应模型已经完成。

## 中文阅读眼动数据

Zhang 等（2022），*The database of eye-movement measures on words in Chinese reading*。

- 论文：<https://doi.org/10.1038/s41597-022-01464-6>
- 原始资料：<https://osf.io/94wue/>
- 数据表：<https://osf.io/download/rmdyj/>
- 授权：CC BY 4.0，<https://creativecommons.org/licenses/by/4.0/>

8,551 个词的原始指标保留于 `eye_measures.original_json`，其中 8,549 个有有效 GD。使用 GD 的参考与按长度中位数回退属于本项目新增的候选初始化，放在独立 `timing_seeds` 表，不修改原始数据。所有 `rsvp_validated` 均为 0。长词外推、难词 +35%、重复最多 -15%、标点停顿与全局乘数是可校准工程参数，不是该论文给出的最佳 ARSVP 显示时长。

## 补充分词资料（0.1.3）

- **jieba**，fxsjy 与贡献者，MIT。只选用 [`dict.txt.big`](https://github.com/fxsjy/jieba/blob/67fa2e36e72f69d9134b8a1037b83fbb070b9775/extra_dict/dict.txt.big) 的部分词形、词性和频数；固定提交 `67fa2e36e72f69d9134b8a1037b83fbb070b9775`。许可全文随包保存为 `jieba-license.txt`。没有打包 Python、HMM 模型或复制其分词引擎。
- **THUOCL**，清华大学自然语言处理与社会人文计算实验室，MIT；项目明确允许研究和商业使用。选用 [`THUOCL_chengyu.txt`](https://github.com/thunlp/THUOCL/blob/a30ce79d895d01ab5132a5c74c29703ff7efb4cc/data/THUOCL_chengyu.txt) 的 8,519 条成语候选，固定提交 `a30ce79d895d01ab5132a5c74c29703ff7efb4cc`；许可全文为 `THUOCL-license.txt`。来源 DF 是新闻文档频数，不是用户已读次数。未导入诗词整句、动物/医疗等全部专业列表。
- 若用于研究成果，按官方要求引用：Shiyi Han, Yuhui Zhang, Yunshan Ma, Cunchao Tu, Zhipeng Guo, Zhiyuan Liu, Maosong Sun. 2016. *THUOCL: Tsinghua Open Chinese Lexicon*。
- 17 项文学固定表达由 Focus Reader 人工复核，保存来源 `focus_reader_narrative_review`；不包含复制的释义。词形筛选不等于逐条人工审定，也不保证所有候选在所有上下文都应合并。

新增 `segmentation_entries` 独立于完整原始辞典条目；记录词形、来源行号、词性、来源频数与候选时长。未附释义的条目在查词界面明确标为分词词条，不生成虚构释义。基础辞典 294,591 条和全部原眼动/时间行保持原样，新增 228,038 条时间种子沿用已有长度参考，不能作为经过 ARSVP 理解试验的值。文件地址、版本、大小、SHA256 与最终数据哈希保存于 `lexicon-expansion-manifest.json`。

未采用 `pwxcoo/chinese-xinhua` 等网络抓取的完整释义集合：其仓库许可不能单独消除上游辞典文本的不明确权利。当前资料也不能统称为无版权公版。

## 程序依赖与字体

React / TypeScript / Vite / Tauri、PDF.js、JSZip、DOMPurify、Marked、Lucide、rusqlite 等的版本由 npm 与 Cargo 锁文件确定。安装依赖中的许可文本和通知收集在同目录 `dependency-licenses.txt`，PDF.js 标准字体的原始许可说明随字体目录保留。阅读字体使用操作系统已安装字体，不随应用分发。应用图标与内置阅读示例为本项目自行绘制/编写。

原始下载网址、大小和 SHA256 见 `sources-manifest.json`；完整构建研究资产与脚本保留于工作区 `audit/2026-10-05/chinese-rsvp-research`。正式对外发行前还需按实际分发包复核依赖和数据通知；本轮没有公开发布。

## 科学术语索引（0.1.17 扩展）

`technical-forms.json` / `technical-terms-provenance.json` 从已署名的 CC-CEDICT 提取完整长词形及人工复核的短科学概念，共 121 形式（含两个单独标记的用户请求写法别名）。保留 CC-CEDICT 贡献者署名及 CC BY-SA 4.0 条件。逐条来源行和可重建脚本 `scripts/build-technical-terms.py` 随源码保存；未改写原释义。此索引不提供或宣称词语实测阅读时长。

## 领域词库（0.1.8）

`domain-corpus.json` 共 61,150 个去重词形，按查词、短词修补、固定词识别区分；来源与行号逐项保存，`domain-corpus-manifest.json` 记录数量和 SHA256。没有将来源 DF 当作个人熟悉度，没有给新词伪造实测毫秒。

- THUOCL / THUNLP，MIT，固定版本 a30ce79d895d01ab5132a5c74c29703ff7efb4cc 的历史名人、计算机、财经、法律、医学五份词表。许可全文见 `THUOCL-license.txt`，快照位于 `corpus-sources`。它们是领域词表，不包含完整释义。
- CC-CEDICT 贡献者，CC BY-SA 4.0。从已保存的词典原条目抽取音乐、文学/流行文化、哲学/思想词形；原释义不改写，索引保留相同署名与许可条件。
- Wikidata 贡献者，CC0 1.0，https://www.wikidata.org/wiki/Wikidata:Licensing 。七个实体的中文标签/别名及短简介（Q1299、Q2306、Q11649、Q15862、Q44190、Q267932、Q38066），不是整部音乐或哲学百科；实体 ID、revision 和原 JSON 快照随数据保留。中文别名用于精确识别，原书文字不改写。批量查询服务返回 429，未声称完成全量导入。

只将已有 jieba / CC-CEDICT 独立佐证的 THUOCL 长词设为强制整词，其他长词仅查询；短词使用既有受约束修补规则。重建脚本 `scripts/build-domain-corpus.py` 默认验证来源锁文件，未使用商业词典扫描件或无许可网页集合。
# English adaptive resources (0.1.14)

Open English WordNet 2025+ by the Open English Wordnet team, derived from Princeton WordNet: CC BY 4.0, original Princeton notices retained. Meanings, headwords, parts of speech and explicit forms are imported into the independent English SQLite resource. See english-licenses/EWN-LICENSE.md and WNDB-LICENSE.txt.

CMU Pronouncing Dictionary, Copyright Carnegie Mellon University: pronunciations and syllable counts, with permitted redistribution under its complete license at english-licenses/CMUDICT-LICENSE.txt. Variant pronunciations are reduced to the shortest syllable candidate; they are not measured reading times.

wordfreq 3.1.1, Copyright Robyn Speer: English public word frequencies only. Data CC BY-SA 4.0; tool code Apache 2.0. Full author and upstream attribution: english-licenses/WORDFREQ-NOTICE.md and WORDFREQ-README.md; license text CC-BY-SA-4.0.txt and WORDFREQ-LICENSE.txt. Frequency data is a usage snapshot through approximately 2021, not personal familiarity.

The combined english-adaptive.sqlite3 data resource and its derived timing candidates are provided under CC BY-SA 4.0; application code is separately licensed. Changes: normalized query keys, selected one CMU pronunciation per key, converted Zipf bins, retained separate senses and forms, added unvalidated engineering duration candidates. Versions, source URLs, hashes and exact counts: english-sources-manifest.json. Rebuild script: scripts/build-english-corpus.py. No source text from private books is part of these resources.

## 拼音补充：Unicode Unihan 17.0.0

Unicode, Inc.，Unicode License V3（完整许可见 `unicode-license.txt`）。来源 https://www.unicode.org/Public/17.0.0/ucd/Unihan.zip ，属性 kMandarin、kHanyuPinlu、kHanyuPinyin；通过 `scripts/build-pinyin.py` 提取、按来源顺序去重，保留单字多音候选。版本、校验及条数见 `pinyin-sources-manifest.json`。不把单字拼接当成词语正确读音，不用于改变分词或阅读时间。词级拼音继续来自已有 CC-CEDICT/教育部原词条，保留各自来源与许可。

## 官网文学阅读示例（2026-10-07）

- 中文：王朔《动物凶猛》，关于夏天的两句短节选，共54字符。原作版权归原权利人；本项目不声明其为公版，不提供小说全文或电影台词。书籍信息与作者、出版社记录：<https://opac.uibe.edu.cn/opac/book/7332062c96f7b9ac495d5353db7b7476>。
- 英文：Douglas Adams, *The Hitchhiker's Guide to the Galaxy* (1979)，手动控制场景的极短对话引句（共79字符含空格与引号）。原作版权归原权利人，引用不意味着本项目拥有其版权或获得全文再分发许可。书籍介绍：<https://penguinrandomhousesecondaryeducation.com/book/?isbn=9780345418913>。网站只包含这两句短引文，不提供书籍下载或私有电子书文件。

中文与英文采用不同书籍，是本地化的编辑示例，互相不构成翻译。四模式播放为交互示意，不加载客户端私有词库或真实时长公式。
