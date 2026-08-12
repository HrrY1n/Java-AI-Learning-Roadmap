# -*- coding: utf-8 -*-
"""数据清洗、去重、排序。"""

from pathlib import Path
import pandas as pd


def main():
    path = Path(__file__).parent / "data" / "raw_students.csv"
    df = pd.read_csv(path)
    print("原始数据：")
    print(df)

    cleaned = (
        df.drop_duplicates()
        .fillna({"score": 0, "target": "未填写"})
        .sort_values("score", ascending=False)
    )
    print("\n清洗后：")
    print(cleaned)


if __name__ == "__main__":
    main()
