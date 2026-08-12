# -*- coding: utf-8 -*-
"""小项目：批量处理多篇文档并导出结果。"""

from pathlib import Path
import csv


def analyze_text(path):
    text = path.read_text(encoding="utf-8")
    return {
        "file": path.name,
        "chars": len(text),
        "lines": len(text.splitlines()),
        "words": len(text.split()),
        "rag_count": text.lower().count("rag"),
    }


def main():
    docs_dir = Path(__file__).parent / "data" / "docs"
    output = Path(__file__).parent / "output" / "text_report.csv"
    output.parent.mkdir(exist_ok=True)

    rows = [analyze_text(path) for path in sorted(docs_dir.glob("*.txt"))]
    with output.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["file", "chars", "lines", "words", "rag_count"])
        writer.writeheader()
        writer.writerows(rows)

    print("处理完成：", output)
    for row in rows:
        print(row)


if __name__ == "__main__":
    main()
