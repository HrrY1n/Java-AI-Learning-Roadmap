# -*- coding: utf-8 -*-
"""练习：读取一个 API 字段。"""

import requests


def main():
    try:
        data = requests.get("https://api.github.com", timeout=5).json()
    except requests.RequestException:
        data = {"message": "使用模拟数据"}
    print(data)


if __name__ == "__main__":
    main()
