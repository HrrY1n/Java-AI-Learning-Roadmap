# -*- coding: utf-8 -*-
"""Day 07 Debug 任务：修复小项目中的模块化错误。"""

from pathlib import Path
from utils import read_file, count_basic_stats, count_keywords


def main():
    input_path = Path(__file__).parent / "sample_text.md"
    text = read_file(input_path)
    stats = count_basic_stats(text)
    keywords = "RAG,retriever,answer"
    counts = count_keywords(text, keywords)
    print(stats)
    print(counts)


if __name__ == "__main__":
    main()

# 提示：检查导入的函数名、文件路径、keywords 的数据类型。
