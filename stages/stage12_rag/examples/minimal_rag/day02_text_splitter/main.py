# -*- coding: utf-8 -*-
"""Split text into overlapping chunks."""

from pathlib import Path


import re


def tokenize(text):
    return re.findall(r"[A-Za-z0-9_\u4e00-\u9fff]+", text.lower())


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


def score(query, chunk):
    query_terms = set(tokenize(query))
    chunk_terms = set(tokenize(chunk))
    return len(query_terms & chunk_terms)


def retrieve(query, chunks, top_k=2):
    ranked = sorted(
        [{"chunk": chunk, "score": score(query, chunk)} for chunk in chunks],
        key=lambda item: item["score"],
        reverse=True,
    )
    return ranked[:top_k]


def mock_answer(question, contexts):
    joined = " ".join(item["chunk"] for item in contexts)
    return f"Mock answer: based on the retrieved references, the question '{question}' is supported by: {joined[:120]}..."



def main():
    text = (Path(__file__).parent / "data" / "sample_text.txt").read_text(encoding="utf-8")
    chunks = split_text(text, chunk_size=30, overlap=5)
    for i, chunk in enumerate(chunks, start=1):
        print(f"--- chunk {i} ---")
        print(chunk)


if __name__ == "__main__":
    main()
