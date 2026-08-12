# -*- coding: utf-8 -*-
"""为什么要评测 RAG。"""


def main():
    metrics = ["引用是否相关", "回答是否覆盖问题", "是否存在幻觉风险", "是否便于人工复查"]
    for item in metrics:
        print("-", item)


if __name__ == "__main__":
    main()
