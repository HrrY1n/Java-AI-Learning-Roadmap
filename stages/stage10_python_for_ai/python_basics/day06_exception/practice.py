# -*- coding: utf-8 -*-
"""Day 06 基础练习：补全异常处理。"""

from pathlib import Path
import json


def exercise_1():
    """安全读取不存在的文件。"""
    path = Path(__file__).parent / "data" / "not_exists.txt"
    # TODO: 用 try/except 捕获 FileNotFoundError。
    print("TODO: 安全读取文件")


def exercise_2():
    """安全解析错误 JSON。"""
    bad_json = '{"title": "RAG", "year": 2024'
    # TODO: 捕获 json.JSONDecodeError。
    print("TODO: 安全解析 JSON")


def exercise_3():
    """处理空用户问题。"""
    question = "   "
    # TODO: 如果 strip 后为空，输出“问题不能为空”。
    print("TODO: 检查空问题")


def exercise_4():
    """安全转换数字。"""
    value = "not-a-number"
    # TODO: 转成 float，失败时使用 0.0。
    print("TODO: 安全转换数字")


def main():
    exercise_1()
    exercise_2()
    exercise_3()
    exercise_4()


if __name__ == "__main__":
    main()
