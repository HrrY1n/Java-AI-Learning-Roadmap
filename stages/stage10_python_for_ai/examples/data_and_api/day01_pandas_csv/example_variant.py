# -*- coding: utf-8 -*-
"""练习：筛选目标岗位。"""

from pathlib import Path
import pandas as pd


def main():
    path = Path(__file__).parent / "data" / "students.csv"
    df = pd.read_csv(path)
    rag_rows = df[df["target"].str.contains("RAG", case=False)]
    print(rag_rows)


if __name__ == "__main__":
    main()
