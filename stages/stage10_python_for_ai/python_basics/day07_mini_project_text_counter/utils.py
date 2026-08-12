# -*- coding: utf-8 -*-
"""工具函数：文本统计、关键词统计、Markdown 报告生成。"""

from pathlib import Path
import re


def read_text_file(path):
    """读取 txt/md 文件，返回文本。"""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"文件不存在：{path}")
    if path.suffix.lower() not in {".txt", ".md"}:
        raise ValueError("只支持 .txt 和 .md 文件")
    return path.read_text(encoding="utf-8")


def count_basic_stats(text):
    """统计字符数、单词数、行数、段落数。"""
    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    words = re.findall(r"[A-Za-z0-9_\u4e00-\u9fff]+", text)
    return {
        "characters": len(text),
        "words": len(words),
        "lines": len(text.splitlines()),
        "paragraphs": len(paragraphs),
    }


def count_keywords(text, keywords):
    """统计关键词频率，忽略大小写。"""
    lower_text = text.lower()
    result = {}
    for keyword in keywords:
        result[keyword] = lower_text.count(keyword.lower())
    return result


def build_markdown_report(input_path, stats, keyword_counts):
    """生成 Markdown 报告。"""
    lines = [
        "# 文档统计报告",
        "",
        f"- 输入文件：{input_path}",
        f"- 字符数：{stats['characters']}",
        f"- 单词数：{stats['words']}",
        f"- 行数：{stats['lines']}",
        f"- 段落数：{stats['paragraphs']}",
        "",
        "## 关键词频率",
        "",
    ]
    for keyword, count in keyword_counts.items():
        lines.append(f"- {keyword}: {count}")
    return "\n".join(lines) + "\n"
