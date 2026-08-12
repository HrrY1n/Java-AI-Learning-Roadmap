# -*- coding: utf-8 -*-
"""批量读取文件夹中的文本。"""

from pathlib import Path


def main():
    docs_dir = Path(__file__).parent / "data" / "docs"
    for path in sorted(docs_dir.glob("*.txt")):
        text = path.read_text(encoding="utf-8")
        print(f"{path.name}: {len(text)} 个字符")


if __name__ == "__main__":
    main()
