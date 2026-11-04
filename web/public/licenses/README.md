# 字体与第三方许可说明

本说明适用于 JavaRoadmap Lab 的静态构建产物。网站不调用 Google Fonts、Adobe Fonts 或其他远程字体服务；页面正文与代码字体名称仅是访客设备已有字体的回退顺序，网站不下载或分发这些系统字体。浏览器最终选择哪一个本地回退字体及其许可由访客的操作系统或已安装软件决定，项目无法核实所有访客设备。

## 网站主动分发的字体

KaTeX 0.16.47 用于渲染课程中的数学公式。构建时，`katex/dist/katex.min.css` 引用的 20 个 `KaTeX_*` 数学字体族由 Vite 复制到 `dist/assets/`，随 GitHub Pages 构建产物一同分发；其中包含 WOFF2、WOFF 和 TTF 三种格式，以及一个内联为 data URL 的 WOFF2 文件。字体文件来自 npm 包 `katex@0.16.47`（<https://www.npmjs.com/package/katex/v/0.16.47>），上游项目为 <https://github.com/KaTeX/KaTeX>。这些字体不是正文或等宽代码字体，不能由普通中文字体替代，否则 KaTeX 的数学度量、可伸缩符号及数学字母表会失效。

### 字体版权与授权

字体文件内嵌以下版权与许可声明；各字体族的 Reserved Font Name 分别为
`KaTeX_AMS`、`KaTeX_Caligraphic`、`KaTeX_Fraktur`、`KaTeX_Main`、`KaTeX_Math`、
`KaTeX_SansSerif`、`KaTeX_Script`、`KaTeX_Size1`、`KaTeX_Size2`、`KaTeX_Size3`、
`KaTeX_Size4` 和 `KaTeX_Typewriter`：

```text
Copyright (c) 2009-2010, Design Science, Inc. (<www.mathjax.org>)
Copyright (c) 2014-2018 Khan Academy (<www.khanacademy.org>),
with Reserved Font Name KaTeX_<Family>.

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license available with a FAQ at: http://scripts.sil.org/OFL
```

上述声明来自 KaTeX 字体构建模板 `katex/src/fonts/lib/Space.ttx`，也与字体文件 nameID 13 中的元数据一致。完整的 SIL Open Font License 1.1 保存在 [OFL-1.1.txt](OFL-1.1.txt)，权威发布地址为 <https://openfontlicense.org/documents/OFL.txt>。OFL 1.1 允许免费商用、嵌入、复制和再分发，条件包括：不得单独出售字体；每次再分发须同时提供上述版权声明和完整许可证；字体本身始终按 OFL 授权；修改版未经书面许可不得使用 Reserved Font Name，也不得暗示原作者背书。本网站分发的是未修改的上游 KaTeX 字体文件。

KaTeX 的 CSS 与 JavaScript 另按 MIT 许可证授权，完整文本见 [KaTeX-MIT.txt](KaTeX-MIT.txt)；版权为 `Copyright (c) 2013-2020 Khan Academy and other contributors`。MIT 要求保留版权与许可通知，因此该文件也随构建产物分发。

## 仅引用本机字体的字体栈

- 正文：`-apple-system, BlinkMacSystemFont, "PingFang SC", "Segoe UI", "Microsoft YaHei", "Noto Sans SC", sans-serif`。
- 代码及窄屏编辑器：`"Cascadia Code", "SF Mono", "JetBrains Mono", Consolas, "Liberation Mono", monospace`。
- Monaco 桌面编辑器：`"Cascadia Code", Consolas, monospace`。
- 数学公式：KaTeX 自己声明的 `KaTeX_*` 字体族；只有在对应数学字体不可用时才由浏览器回退。

这些名称中的厂商字体（如 PingFang SC、Microsoft YaHei、Cascadia Code、Consolas）仅由访客浏览器在本地解析，网站没有 `@font-face`、字体二进制文件或远程字体请求。因此不存在由本站执行的字体再分发或商用授权核发；各名称的本机可用性、字形覆盖和许可取决于设备。中英文、常用符号和 emoji 在缺失首选字体时由浏览器选择后续系统回退，无法逐台设备保证相同来源或字形。

## 其他依赖边界

Monaco 编辑器的构建使用 `editor.api` 入口，当前产物不包含 `codicon.ttf` 的 `@font-face` 或字体文件。Playwright 测试工具包内的字体和非网站测试报告中的字体不属于静态网站分发物，也不复制到 `web/dist/`。课程 PDF 位于 `output/pdf/`，不是网站静态资源。若未来主动引入这些或其他字体二进制文件，应先核实逐项来源、版本、版权、商用与再分发条件，再将完整许可证和声明加入本目录。
