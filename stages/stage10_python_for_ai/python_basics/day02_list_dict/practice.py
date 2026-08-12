# -*- coding: utf-8 -*-
"""Day 02 基础练习：列表、字典、循环。"""


papers = [
    {"title": "RAG for Patent Search", "year": 2023, "keywords": ["RAG", "patent"]},
    {"title": "Prompt Engineering Notes", "year": 2022, "keywords": ["prompt", "LLM"]},
    {"title": "RAG Evaluation Report", "year": 2024, "keywords": ["RAG", "evaluation"]},
]


def exercise_1():
    """输出所有论文标题。"""
    # TODO: 遍历 papers，只输出 title。
    print("TODO: 输出所有论文标题")


def exercise_2():
    """筛选 2023 年及以后的论文。"""
    # TODO: 输出 year >= 2023 的论文标题。
    print("TODO: 输出 2023 年及以后的论文")


def exercise_3():
    """筛选关键词包含 RAG 的论文。"""
    # TODO: 注意大小写，输出包含 RAG 的论文标题。
    print("TODO: 输出 RAG 论文")


def exercise_4():
    """统计所有关键词出现次数。"""
    # TODO: 返回并打印一个 dict，例如 {'rag': 2, 'patent': 1}
    print("TODO: 输出关键词频率")


def main():
    exercise_1()
    exercise_2()
    exercise_3()
    exercise_4()


if __name__ == "__main__":
    main()
