# -*- coding: utf-8 -*-
"""Streamlit 页面。运行：streamlit run app.py"""

import re
import streamlit as st


def tokenize(text):
    return re.findall(r"[A-Za-z0-9_\u4e00-\u9fff]+", text.lower())


def split_text(text, chunk_size=80, overlap=20):
    words = text.split()
    if not words:
        return []
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        if end >= len(words):
            break
        start = end - overlap
    return chunks


def retrieve(question, chunks, top_k=3):
    query_terms = set(tokenize(question))
    rows = []
    for chunk in chunks:
        score = len(query_terms & set(tokenize(chunk)))
        rows.append({"chunk": chunk, "score": score})
    return sorted(rows, key=lambda item: item["score"], reverse=True)[:top_k]


st.set_page_config(page_title="RAG 论文问答助手", page_icon="📄")
st.title("RAG 论文问答助手")

uploaded = st.file_uploader("上传 txt 或 md 文件", type=["txt", "md"])
question = st.text_input("请输入问题", value="RAG 的核心流程是什么？")

if uploaded:
    text = uploaded.read().decode("utf-8")
else:
    text = "RAG 先读取文档，然后切分文本，检索相关片段，最后把片段和问题拼接进 Prompt 生成回答。"

chunks = split_text(text)

if st.button("生成回答"):
    results = retrieve(question, chunks)
    st.subheader("回答")
    st.write("模拟回答：根据引用片段，RAG 会先检索相关内容，再生成有依据的回答。")
    st.subheader("引用片段")
    for index, item in enumerate(results, start=1):
        st.markdown(f"**[{index}] score={item['score']}**")
        st.write(item["chunk"])
