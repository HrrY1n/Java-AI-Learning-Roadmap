# -*- coding: utf-8 -*-
"""小项目：RAG 论文问答核心系统。"""


from pathlib import Path
import sys

CURRENT_DIR = Path(__file__).parent
sys.path.append(str(CURRENT_DIR))

from simple_vector_store import SimpleVectorStore


def split_text(text, chunk_size=80, overlap=20):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        if end >= len(words):
            break
        start = end - overlap
    return chunks


def main():
    paper = Path(__file__).parent / "data" / "sample_paper.txt"
    chunks = split_text(paper.read_text(encoding="utf-8"))
    store = SimpleVectorStore()
    store.add_texts(chunks)

    question = input("请输入问题，直接回车使用默认问题：").strip() or "本文如何实现 RAG？"
    results = store.search(question, top_k=3)
    print("\n模拟回答：根据检索片段，本文通过文档切分、向量检索和 Prompt 拼接实现 RAG。")
    print("\n引用片段：")
    for index, item in enumerate(results, start=1):
        print(f"[{index}] score={item['score']:.4f} {item['text']}")


if __name__ == "__main__":
    main()
