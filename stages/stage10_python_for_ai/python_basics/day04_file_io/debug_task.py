# -*- coding: utf-8 -*-
"""Day 04 Debug 任务：修复路径和编码问题。"""

from pathlib import Path


def main():
    # Bug 1: 文件名写错，真实文件在 data/sample_article.txt。
    path = Path(__file__).parent / "sample_article.txt"

    # Bug 2: 如果文件不存在，直接读取会报 FileNotFoundError。
    text = path.read_text()

    # Bug 3: splitlines 少了括号，lines 会变成方法对象。
    lines = text.splitlines
    print("行数：", len(lines))


if __name__ == "__main__":
    main()

# 提示：先看报错类型，再检查路径、encoding 和函数调用括号。
