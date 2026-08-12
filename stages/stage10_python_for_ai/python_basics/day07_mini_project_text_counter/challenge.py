# -*- coding: utf-8 -*-
"""Day 07 进阶练习：批量处理多个 txt/md 文档。"""

from pathlib import Path
from utils import read_text_file, count_basic_stats


def main():
    base_dir = Path(__file__).parent
    candidates = list(base_dir.glob("*.txt")) + list(base_dir.glob("*.md"))

    # TODO 1: 遍历 candidates。
    # TODO 2: 对每个文件调用 read_text_file 和 count_basic_stats。
    # TODO 3: 生成 Markdown 表格，保存为 batch_output_report.md。
    print("TODO: 批量处理文件数量：", len(candidates))


if __name__ == "__main__":
    main()
