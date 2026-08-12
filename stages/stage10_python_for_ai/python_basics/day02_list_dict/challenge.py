# -*- coding: utf-8 -*-
"""Day 02 进阶练习：格式化检索结果。"""


def main():
    retrieval_results = [
        {"chunk_id": "doc1-001", "score": 0.86, "text": "RAG retrieves relevant chunks."},
        {"chunk_id": "doc1-002", "score": 0.42, "text": "Prompt templates organize the answer."},
        {"chunk_id": "doc2-001", "score": 0.91, "text": "Evaluation checks reference quality."},
    ]

    # TODO 1: 按 score 从高到低排序。
    # TODO 2: 只输出 score >= 0.5 的结果。
    # TODO 3: 输出 Markdown 列表，例如：- doc2-001 | 0.91 | Evaluation...
    print("TODO: 输出排序后的高相关检索结果")


if __name__ == "__main__":
    main()
