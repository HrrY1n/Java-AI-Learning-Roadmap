# -*- coding: utf-8 -*-
"""Day 05 进阶练习：把 API 风格 JSON 转成检索候选表。"""

import json


def main():
    api_response = {
        "data": [
            {"id": "p1", "title": "RAG for Patent Search", "score": 0.88},
            {"id": "p2", "title": "Prompt Template Study", "score": 0.61},
            {"id": "p3", "title": "RAG Evaluation", "score": 0.93},
        ]
    }

    # TODO 1: 从 api_response["data"] 取出列表。
    # TODO 2: 筛选 score >= 0.8 的结果。
    # TODO 3: 输出 JSON 字符串，要求 ensure_ascii=False, indent=2。
    print(json.dumps(api_response, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
