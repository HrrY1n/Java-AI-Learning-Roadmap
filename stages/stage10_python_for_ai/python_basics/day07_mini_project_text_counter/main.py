# -*- coding: utf-8 -*-
"""Day 07 小项目：文本/Markdown 文档统计器。"""

from pathlib import Path
from utils import read_text_file, count_basic_stats, count_keywords, build_markdown_report


def main():
    base_dir = Path(__file__).parent
    input_path = base_dir / "sample_text.txt"
    output_path = base_dir / "output_report.md"
    keywords = ["RAG", "retriever", "answer", "evaluation", "references"]

    try:
        text = read_text_file(input_path)
    except (FileNotFoundError, ValueError) as exc:
        print("读取文件失败：", exc)
        return

    if not text.strip():
        print("文件内容为空，无法生成报告。")
        return

    stats = count_basic_stats(text)
    keyword_counts = count_keywords(text, keywords)
    report = build_markdown_report(input_path, stats, keyword_counts)
    output_path.write_text(report, encoding="utf-8")

    print("报告已生成：", output_path)
    print(report)


if __name__ == "__main__":
    main()
