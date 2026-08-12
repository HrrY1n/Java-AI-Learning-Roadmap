# -*- coding: utf-8 -*-
"""Day 04 示例：读取文章，统计信息，并写入 Markdown 报告。"""

from pathlib import Path


def analyze_text(text):
    lines = text.splitlines()
    non_empty_lines = [line for line in lines if line.strip()]
    paragraphs = [p for p in text.split("\n\n") if p.strip()]
    words = text.split()
    return {
        "characters": len(text),
        "lines": len(lines),
        "non_empty_lines": len(non_empty_lines),
        "paragraphs": len(paragraphs),
        "words": len(words),
    }


def build_report(input_path, stats):
    return f"""# 文档统计报告

- 文件路径：{input_path}
- 字符数：{stats['characters']}
- 行数：{stats['lines']}
- 非空行数：{stats['non_empty_lines']}
- 段落数：{stats['paragraphs']}
- 单词数：{stats['words']}
"""


def main():
    base_dir = Path(__file__).parent
    input_path = base_dir / "data" / "sample_article.txt"
    output_path = base_dir / "output" / "report.md"
    output_path.parent.mkdir(exist_ok=True)

    if not input_path.exists():
        print(f"文件不存在：{input_path}")
        return

    text = input_path.read_text(encoding="utf-8")
    stats = analyze_text(text)
    report = build_report(input_path, stats)
    output_path.write_text(report, encoding="utf-8")

    print("统计完成，报告已生成：", output_path)
    print(report)


if __name__ == "__main__":
    main()
