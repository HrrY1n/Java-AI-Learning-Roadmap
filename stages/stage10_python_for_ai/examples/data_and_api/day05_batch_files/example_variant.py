# -*- coding: utf-8 -*-
"""练习：统计每个文件的行数。"""

from pathlib import Path


def main():
    docs_dir = Path(__file__).parent / "data" / "docs"
    for path in sorted(docs_dir.glob("*.txt")):
        lines = path.read_text(encoding="utf-8").splitlines()
        print(f"{path.name}: {len(lines)} 行")


if __name__ == "__main__":
    main()
