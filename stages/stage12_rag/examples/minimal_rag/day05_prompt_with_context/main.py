# -*- coding: utf-8 -*-
"""Put retrieved chunks into a prompt."""

import re


def tokenize(text):
    return re.findall(r"[A-Za-z0-9_\u4e00-\u9fff]+", text.lower())


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


def build_prompt(question, contexts):
    context_text = "\n".join(
        f"[{i}] {item['chunk']}" for i, item in enumerate(contexts, start=1)
    )
    return (
        "Answer only from the references.\n"
        "References:\n"
        f"{context_text}\n"
        f"Question: {question}"
    )


def main():
    chunks = ["RAG retrieves relevant chunks first.", "Answers should show reference evidence."]
    contexts = retrieve("Why does RAG need references?", chunks, top_k=2)
    prompt = build_prompt("Why does RAG need references?", contexts)
    print(prompt)


if __name__ == "__main__":
    main()
