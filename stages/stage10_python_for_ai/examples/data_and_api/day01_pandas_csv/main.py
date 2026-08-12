# -*- coding: utf-8 -*-
"""使用 pandas 读取和筛选 CSV。"""

from pathlib import Path
import pandas as pd


def main():
    path = Path(__file__).parent / "data" / "students.csv"
    df = pd.read_csv(path)
    print("原始数据：")
    print(df)

    high_score = df[df["score"] >= 85]
    print("\n分数 >= 85 的记录：")
    print(high_score)


if __name__ == "__main__":
    main()
