# -*- coding: utf-8 -*-
"""Day 04 基础练习：补全文档读取和报告写入。"""

from pathlib import Path


def exercise_1():
    """读取 sample_article.txt 并输出前 80 个字符。"""
    path = Path(__file__).parent / "data" / "sample_article.txt"
    # TODO: 读取文件并输出前 80 个字符。
    print("TODO: 输出文本预览")


def exercise_2():
    """统计文本行数和单词数。"""
    path = Path(__file__).parent / "data" / "sample_article.txt"
    text = path.read_text(encoding="utf-8")
    # TODO: 统计 lines 和 words。
    print("TODO: 输出行数和单词数")


def exercise_3():
    """把统计结果写入 output/practice_report.md。"""
    output = Path(__file__).parent / "output" / "practice_report.md"
    output.parent.mkdir(exist_ok=True)
    # TODO: 写入 Markdown 报告。
    print("TODO: 写入报告", output)


def exercise_4():
    """如果文件不存在，输出友好提示。"""
    missing = Path(__file__).parent / "data" / "missing.txt"
    # TODO: 用 if missing.exists() 判断。
    print("TODO: 处理文件不存在")


def main():
    exercise_1()
    exercise_2()
    exercise_3()
    exercise_4()


if __name__ == "__main__":
    main()
