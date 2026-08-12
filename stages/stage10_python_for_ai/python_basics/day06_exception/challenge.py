# -*- coding: utf-8 -*-
"""Day 06 进阶练习：验证 RAG 配置。"""


def validate_config(config):
    """TODO: 验证 top_k 和 min_score。"""
    # 要求：
    # 1. top_k 必须能转成 int，并且大于 0。
    # 2. min_score 必须能转成 float，并且在 0 到 1 之间。
    # 3. 返回 {'ok': True, 'config': ...} 或 {'ok': False, 'error': ...}
    return {"ok": False, "error": "TODO"}


def main():
    examples = [
        {"top_k": "3", "min_score": "0.5"},
        {"top_k": "0", "min_score": "0.5"},
        {"top_k": "abc", "min_score": "bad"},
    ]
    for item in examples:
        print(validate_config(item))


if __name__ == "__main__":
    main()
