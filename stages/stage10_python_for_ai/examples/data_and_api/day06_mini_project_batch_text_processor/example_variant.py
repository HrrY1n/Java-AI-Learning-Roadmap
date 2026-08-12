# -*- coding: utf-8 -*-
"""练习：给批量报告增加 keyword_count 字段。"""

from pathlib import Path


def main():
    keyword = "python"
    docs_dir = Path(__file__).parent / "data" / "docs"
    for path in sorted(docs_dir.glob("*.txt")):
        text = path.read_text(encoding="utf-8").lower()
        print(f"{path.name}: {keyword}={text.count(keyword)}")


if __name__ == "__main__":
    main()
