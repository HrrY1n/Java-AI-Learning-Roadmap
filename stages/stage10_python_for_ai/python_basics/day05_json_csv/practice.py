# -*- coding: utf-8 -*-
"""Day 05 基础练习：JSON 读取和 CSV 写入。"""

from pathlib import Path
import csv
import json


def exercise_1():
    """读取 papers.json 并输出论文数量。"""
    path = Path(__file__).parent / "data" / "papers.json"
    # TODO: 读取 JSON，输出 len(papers)。
    print("TODO: 输出论文数量")


def exercise_2():
    """输出所有论文标题和年份。"""
    path = Path(__file__).parent / "data" / "papers.json"
    papers = json.loads(path.read_text(encoding="utf-8"))
    # TODO: 遍历 papers，输出 title 和 year。
    print("TODO: 输出标题和年份")


def exercise_3():
    """筛选关键词包含 RAG 的论文。"""
    path = Path(__file__).parent / "data" / "papers.json"
    papers = json.loads(path.read_text(encoding="utf-8"))
    # TODO: 输出 keywords 包含 RAG 的论文。
    print("TODO: 输出 RAG 论文")


def exercise_4():
    """保存一个 practice_summary.csv。"""
    output = Path(__file__).parent / "output" / "practice_summary.csv"
    output.parent.mkdir(exist_ok=True)
    # TODO: 用 csv.DictWriter 写入 title/year 两列。
    print("TODO: 保存 CSV", output)


def main():
    exercise_1()
    exercise_2()
    exercise_3()
    exercise_4()


if __name__ == "__main__":
    main()
