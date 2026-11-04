# 字体与第三方许可说明

本说明适用于 JavaRoadmap Lab 的静态构建产物。网站优先自托管并主动分发合规开源字体，不调用 Google Fonts、Adobe Fonts 或其他外部远程字体 CDN，不存在因字体服务导致的访客隐私泄露（如 IP、Referer）或网络依赖与服务可用性风险。

## 网站主动分发与自托管的字体

网站构建产物主动打包并向访客分发以下三类开源字体，均具有明确的免费商业使用与再分发授权：

### 1. Noto Sans SC（自托管正文字体子集）

- **用途**：全站正文首选字体，用于标题、段落、侧边栏、卡片、导航及基础界面。
- **字体版本**：2.004。
- **上游来源**：
  - [notofonts/noto-cjk](https://github.com/notofonts/noto-cjk)（发布标签 `Sans2.004`，提交 `523d033d6cb47f4a80c58a35753646f5c3608a78`）。
  - [google/fonts](https://github.com/google/fonts/tree/main/ofl/notosanssc)（提交 `023eedd8780dd254e5905901473ed55e5475ee73`）。
  - 字形基础源自 Adobe [Source Han Sans（思源黑体）](https://github.com/adobe-fonts/source-han-sans)。
- **格式与体积**：WOFF2 可变字重（`wght` 100–900），经专业子集化优化后体积约 994 KB。
- **覆盖范围**：3,800 个 Unicode 字符，包含全部基础 ASCII 字符、Latin-1 Supplement 常用扩展符号、教育部《通用规范汉字表》一级字表全部 3,500 个常用汉字，以及全站课程、习题、预测与文档中出现的全部中文字符与全角/数学符号。
- **授权许可证**：[SIL Open Font License 1.1](OFL-1.1.txt)（OFL-1.1）。
- **版权声明与保留名称**：
  ```text
  Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name 'Source'.
  This Font Software is licensed under the SIL Open Font License, Version 1.1.
  ```
  本站修改版子集不使用 Reserved Font Name `'Source'`，完全符合 OFL 规定。允许免费商业使用、研究、修改及随网站/软件再分发。

### 2. Noto Sans Mono（自托管等宽代码字体子集）

- **用途**：代码区（`<pre><code>`、内联代码）、窄屏编辑器及桌面 Monaco 编辑器的首选等宽字体。
- **字体版本**：v2.014。
- **上游来源**：
  - [notofonts/latin-greek-cyrillic](https://github.com/notofonts/latin-greek-cyrillic)（发布标签 `NotoSansMono-v2.014`，提交 `9b7310b8f99fcd2583c49606e6aefca13a391350`）。
  - [google/fonts](https://github.com/google/fonts/tree/main/ofl/notosansmono)（提交 `023eedd8780dd254e5905901473ed55e5475ee73`）。
- **格式与体积**：WOFF2 可变字重（`wght` 100–900）与可变字宽（`wdth` 62.5–100），子集化后体积约 197 KB。
- **覆盖范围**：1,106 个 Unicode 字符，包含 ASCII、Latin-1 Supplement、扩展拉丁字母、编程常用符号、制表符、方块元素、箭头及常用数学运算符。当代码块中出现中文字符（如代码注释或字符串字面量）时，浏览器根据字体栈平滑回退至 `Noto Sans SC`。
- **授权许可证**：[SIL Open Font License 1.1](OFL-1.1.txt)（OFL-1.1）。
- **版权声明**：
  ```text
  Copyright 2022 The Noto Project Authors (https://github.com/notofonts/latin-greek-cyrillic)
  This Font Software is licensed under the SIL Open Font License, Version 1.1.
  ```
  该字体无保留名称（Reserved Font Name）。允许免费商业使用、修改及随网站/软件再分发。

### 3. KaTeX 数学字体（保留专业数学排版）

- **用途**：用于渲染课程中的 LaTeX 渐近复杂度与科学公式（如 $O(n)$、$O(\log n)$、$\sum$、分式等）。
- **字体版本**：KaTeX 0.16.47（内嵌字体版本为 Version 1.1; ttfautohint v1.8.3）。
- **上游来源**：npm 包 `katex@0.16.47`（<https://www.npmjs.com/package/katex/v/0.16.47>），项目地址 <https://github.com/KaTeX/KaTeX>。
- **格式与文件**：包含 20 个 `KaTeX_*` 字体面、59 个独立的 WOFF2/WOFF/TTF 字体文件及 1 个内联 WOFF2。保留 KaTeX 专用数学字体，不使用普通中文字体替换，以保证 TeX 数学度量、弹性定界符和数学字母表不发生布局错乱或字符缺失。
- **授权许可证**：[SIL Open Font License 1.1](OFL-1.1.txt)（OFL-1.1）。
- **版权声明与 12 个保留字体名称**（Reserved Font Names）：
  `KaTeX_AMS`、`KaTeX_Caligraphic`、`KaTeX_Fraktur`、`KaTeX_Main`、`KaTeX_Math`、
  `KaTeX_SansSerif`、`KaTeX_Script`、`KaTeX_Size1`、`KaTeX_Size2`、`KaTeX_Size3`、
  `KaTeX_Size4`、`KaTeX_Typewriter`。
  ```text
  Copyright (c) 2009-2010, Design Science, Inc. (<www.mathjax.org>)
  Copyright (c) 2014-2018 Khan Academy (<www.khanacademy.org>),
  with Reserved Font Name KaTeX_<Family>.

  This Font Software is licensed under the SIL Open Font License, Version 1.1.
  This license available with a FAQ at: http://scripts.sil.org/OFL
  ```
  KaTeX 的 CSS 与 JavaScript 另按 MIT 许可证授权，完整文本见 [KaTeX-MIT.txt](KaTeX-MIT.txt)，版权为 `Copyright (c) 2013-2020 Khan Academy and other contributors`。

## 字体栈设计与系统回退边界

网站在 CSS 及 Monaco 编辑器中配置了完整的优先级字体栈：

- **正文**：
  `"Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", "Microsoft YaHei", sans-serif`
- **代码区**：
  `"Noto Sans Mono", "Noto Sans SC", "Cascadia Code", "SF Mono", Consolas, "Liberation Mono", monospace`
- **Monaco 桌面代码编辑器**：
  `"Noto Sans Mono", "Noto Sans SC", "Cascadia Code", Consolas, monospace`
- **数学公式**：
  KaTeX 独立的 `KaTeX_*` 系列字体族，仅在数学字体加载异常时由浏览器执行回退。

### 系统回退边界如实说明

1. **生僻字回退**：自托管的 `Noto Sans SC` 子集完整收录了国家教育部《通用规范汉字表》一级字表全部 3,500 字以及网站所有课程、习题、文档内的全部汉字。若未来遇到极生僻字或古籍异体字，浏览器将按字体栈依次向后尝试访客操作系统中已安装的系统字体（如 macOS 的 PingFang SC、Windows 的 Microsoft YaHei）。
2. **彩色 Emoji 与厂商特殊符号**：网站未打包体积庞大的独立彩色 Emoji 字体（通常单文件超过 20MB），遇到系统级 Emoji 时由访客设备操作系统自行回退（如 Apple Color Emoji、Segoe UI Emoji、Noto Color Emoji）。
3. **系统字体许可边界**：访客设备上自行安装的操作系统与厂商字体（如 PingFang SC、Microsoft YaHei、Segoe UI、Cascadia Code、Consolas 等）由其各自的操作系统授权许可管辖。网站不向访客设备分发这些厂商专有字体文件，亦无法且不会声称已经验证或控制了所有访客设备上的本地字体许可。

## 其他依赖与环境边界

Monaco 编辑器采用 `editor.api` 精简构建，产物中不分发 `codicon.ttf` 图标字体。Playwright 测试套件及内部 trace 工具中的字体仅属于本地开发测试依赖，不会打包至发布产物 `web/dist/` 中。课程 PDF 存储在 `output/pdf/` 目录，不属于前端静态资产。
