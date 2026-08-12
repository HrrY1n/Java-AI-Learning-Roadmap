# -*- coding: utf-8 -*-
"""参考示例：用词项重叠理解最小 Top-k 检索。

Scenario：文档片段变多后，不能靠人工逐段寻找与问题相关的上下文。
Mental model：query/chunk → tokenize → overlap score → rank → Top-k。
Observe：先预测每个片段的分数和顺序，再运行验证。
Modify：改变 query 或 top_k，观察返回片段如何变化。
Limit：这不是 embedding；没有阈值时，零分片段也可能进入 Top-k。
"""


import re


def tokenize(text):
    return re.findall(r"[A-Za-z0-9_\u4e00-\u9fff]+", text.lower())


def score(query, chunk):
    query_terms = set(tokenize(query))
    chunk_terms = set(tokenize(chunk))
    # 集合交集只保留“共同出现过的词项”，故意忽略词频、语序和语义。
    return len(query_terms & chunk_terms)


def retrieve(query, chunks, top_k=2):
    # 先给所有片段打分再排序，便于观察最小检索流程；真实系统还需要阈值和明确的同分处理策略。
    ranked = sorted(
        [{"chunk": chunk, "score": score(query, chunk)} for chunk in chunks],
        key=lambda item: item["score"],
        reverse=True,
    )
    return ranked[:top_k]


def main():
    chunks = [
        "Python can read files and process data.",
        "RAG retrieves relevant document chunks before answering.",
        "Streamlit can build a simple web demo.",
    ]
    query = "How does RAG answer questions?"
    results = retrieve(query, chunks, top_k=2)
    print(f"Query: {query}")
    for item in results:
        print(f"score={item['score']} | chunk={item['chunk']}")

    # Modify：把 top_k 改成 1，再把 query 换成文档中不存在的词；解释零分结果为何仍会返回。
    # Exercise：独立设计最小分数过滤，并说明“无结果”应如何交给后续回答层处理。


if __name__ == "__main__":
    main()
