# -*- coding: utf-8 -*-
"""Day 07 基础练习：改造文本统计器。"""

from pathlib import Path
from utils import read_text_file, count_basic_stats, count_keywords


def exercise_1():
    """读取 sample_text.txt，输出文本前 100 个字符。"""
    path = Path(__file__).parent / "sample_text.txt"
    # TODO: 调用 read_text_file，并输出预览。
    print("TODO: 输出文本预览")


def exercise_2():
    """统计基础信息。"""
    path = Path(__file__).parent / "sample_text.txt"
    text = read_text_file(path)
    # TODO: 调用 count_basic_stats，并输出 stats。
    print("TODO: 输出基础统计")


def exercise_3():
    """修改关键词列表并统计。"""
    path = Path(__file__).parent / "sample_text.txt"
    text = read_text_file(path)
    keywords = ["RAG", "document", "chunk"]
    # TODO: 调用 count_keywords。
    print("TODO: 输出关键词频率")


def exercise_4():
    """思考：如果用户给的是 md 文件，程序是否还能运行？"""
    # TODO: 把 sample_text.txt 复制或改名成 .md，测试 read_text_file。
    print("TODO: 测试 md 文件")


def main():
    exercise_1()
    exercise_2()
    exercise_3()
    exercise_4()


if __name__ == "__main__":
    main()
