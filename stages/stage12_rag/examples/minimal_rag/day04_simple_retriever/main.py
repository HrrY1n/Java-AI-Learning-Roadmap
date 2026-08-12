# -*- coding: utf-8 -*-
"""Implement Top-k retrieval."""


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
    chunks = [
        "Python can read files and process data.",
        "RAG retrieves relevant document chunks before answering.",
        "Streamlit can build a simple web demo.",
    ]
    results = retrieve("How does RAG answer questions?", chunks, top_k=2)
    for item in results:
        print(item)


if __name__ == "__main__":
    main()
