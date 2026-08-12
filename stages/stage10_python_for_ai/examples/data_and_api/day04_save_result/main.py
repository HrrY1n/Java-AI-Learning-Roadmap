# -*- coding: utf-8 -*-
"""把 API 结果保存为 JSON / CSV。"""

from pathlib import Path
import csv
import json
import requests


def fetch_data():
    try:
        return requests.get("https://api.github.com", timeout=5).json()
    except requests.RequestException:
        return {"source": "mock", "status": "offline"}


def main():
    data_dir = Path(__file__).parent / "output"
    data_dir.mkdir(exist_ok=True)
    data = fetch_data()

    json_path = data_dir / "api_result.json"
    csv_path = data_dir / "api_keys.csv"
    json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    with csv_path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["key", "value"])
        for key, value in data.items():
            writer.writerow([key, value])

    print("已保存：", json_path)
    print("已保存：", csv_path)


if __name__ == "__main__":
    main()
