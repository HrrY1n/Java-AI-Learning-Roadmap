# -*- coding: utf-8 -*-
"""Day 04 进阶练习：批量统计 data 目录下的 txt 文件。"""

from pathlib import Path


def main():
    data_dir = Path(__file__).parent / "data"
    output = Path(__file__).parent / "output" / "batch_report.md"
    output.parent.mkdir(exist_ok=True)

    # TODO 1: 遍历 data_dir.glob("*.txt")。
    # TODO 2: 对每个文件统计字符数、行数、单词数。
    # TODO 3: 写成 Markdown 表格。
    output.write_text("# TODO: 批量报告\n", encoding="utf-8")
    print("TODO: 生成批量报告", output)


if __name__ == "__main__":
    main()
