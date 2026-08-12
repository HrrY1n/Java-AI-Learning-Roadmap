# -*- coding: utf-8 -*-
"""Day 05 Debug 任务：修复 JSON/CSV 常见错误。"""

from pathlib import Path
import csv
import json


def main():
    path = Path(__file__).parent / "data" / "papers.json"
    papers = json.load(path.read_text(encoding="utf-8"))  # Bug 1: json.load 需要文件对象。

    first = papers[0]
    print(first["name"])  # Bug 2: key 应该是 title。

    output = Path(__file__).parent / "output" / "broken.csv"
    with output.open("w", encoding="utf-8") as f:  # Bug 3: output 目录可能不存在。
        writer = csv.DictWriter(f, fieldnames=["title", "year"])
        writer.writeheader()
        writer.writerows(papers)


if __name__ == "__main__":
    main()

# 提示：分别修复 json.load/json.loads、字典 key、output 目录。
