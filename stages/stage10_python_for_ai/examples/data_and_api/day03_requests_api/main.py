# -*- coding: utf-8 -*-
"""使用 requests 调用公开 API。"""

import requests


def main():
    url = "https://api.github.com"
    try:
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as exc:
        print("网络请求失败，使用本地模拟数据。原因：", exc)
        data = {"current_user_url": "mock://user", "zen_url": "mock://zen"}

    print("API 返回字段：")
    for key in list(data.keys())[:5]:
        print("-", key)


if __name__ == "__main__":
    main()
