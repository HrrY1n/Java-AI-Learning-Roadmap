# -*- coding: utf-8 -*-
"""Day 06 示例：让文档处理代码更健壮。"""

from pathlib import Path
import json


def safe_read_text(path):
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None


def safe_load_json(text):
    try:
        return json.loads(text)
    except json.JSONDecodeError as exc:
        print(f"JSON 格式错误：第 {exc.lineno} 行，第 {exc.colno} 列")
        return None


def normalize_question(question):
    cleaned = question.strip()
    if not cleaned:
        raise ValueError("用户问题不能为空")
    return cleaned


def safe_to_float(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def main():
    missing_path = Path(__file__).parent / "data" / "missing.json"
    text = safe_read_text(missing_path)
    if text is None:
        print("文件不存在，使用默认配置。")
        text = '{"top_k": "3", "min_score": "0.5"}'

    config = safe_load_json(text)
    if config is None:
        config = {"top_k": "2", "min_score": "0.0"}

    question_examples = [" 什么是 RAG？ ", "   "]
    for question in question_examples:
        try:
            print("清洗后问题：", normalize_question(question))
        except ValueError as exc:
            print("问题错误：", exc)

    min_score = safe_to_float(config.get("min_score"), default=0.0)
    print("最低分数阈值：", min_score)


if __name__ == "__main__":
    main()
