# -*- coding: utf-8 -*-
"""练习：找出分数最高的 2 条记录。"""

from pathlib import Path
import pandas as pd


def main():
    path = Path(__file__).parent / "data" / "raw_students.csv"
    df = pd.read_csv(path).drop_duplicates().fillna({"score": 0})
    print(df.sort_values("score", ascending=False).head(2))


if __name__ == "__main__":
    main()
