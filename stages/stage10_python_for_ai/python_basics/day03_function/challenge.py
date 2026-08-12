# -*- coding: utf-8 -*-
"""Day 03 进阶练习：把检索结果转成 Prompt。"""


def format_references(results):
    """TODO: 把检索结果列表格式化为带编号的引用文本。"""
    return "TODO"


def build_rag_prompt(question, results):
    """TODO: 调用 format_references，生成完整 RAG Prompt。"""
    return "TODO"


def main():
    results = [
        {"id": "chunk-1", "text": "RAG retrieves relevant chunks.", "score": 0.91},
        {"id": "chunk-2", "text": "The answer should cite evidence.", "score": 0.87},
    ]
    question = "RAG 回答为什么需要引用？"
    print(build_rag_prompt(question, results))


if __name__ == "__main__":
    main()
