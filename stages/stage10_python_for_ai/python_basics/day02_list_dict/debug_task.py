# -*- coding: utf-8 -*-
"""Day 02 Debug 任务：修复列表和字典相关错误。"""


def main():
    paper = {
        "title": "RAG for Document QA",
        "year": 2024,
        "keywords": ["RAG", "QA", "retrieval"],
    }

    # Bug 1: key 写错。
    print(paper["titel"])

    # Bug 2: 索引越界。
    print(paper["keywords"][3])

    # Bug 3: 逻辑错误，keywords 是 list，不能直接 lower。
    if "rag" in paper["keywords"].lower():
        print("This is a RAG paper.")


if __name__ == "__main__":
    main()

# 提示：不要直接看答案。先运行文件，观察 KeyError、IndexError、AttributeError。
