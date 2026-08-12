# -*- coding: utf-8 -*-
"""Day 05 示例：读取论文 JSON，导出 CSV 摘要。"""

from pathlib import Path
import csv
import json


def load_papers(path):
    return json.loads(path.read_text(encoding="utf-8"))


def summarize_paper(paper):
    return {
        "title": paper["title"],
        "year": paper["year"],
        "keywords": "; ".join(paper["keywords"]),
        "keyword_count": len(paper["keywords"]),
    }


def save_csv(rows, output_path):
    output_path.parent.mkdir(exist_ok=True)
    fieldnames = ["title", "year", "keywords", "keyword_count"]
    with output_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def main():
    base_dir = Path(__file__).parent
    json_path = base_dir / "data" / "papers.json"
    csv_path = base_dir / "output" / "papers_summary.csv"

    papers = load_papers(json_path)
    recent_papers = [paper for paper in papers if paper["year"] >= 2023]
    rows = [summarize_paper(paper) for paper in recent_papers]
    save_csv(rows, csv_path)

    print("读取论文数量：", len(papers))
    print("2023 年及以后论文数量：", len(recent_papers))
    print("CSV 已保存：", csv_path)
    for row in rows:
        print(row)


if __name__ == "__main__":
    main()
