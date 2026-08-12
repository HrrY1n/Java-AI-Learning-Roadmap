# -*- coding: utf-8 -*-
"""RAG API 的核心逻辑，保持简单，方便 FastAPI 调用。"""


DOCUMENT = """
RAG 系统会读取文档、切分文本、检索相关片段，并把片段放入 Prompt。
这个 API 示例返回模拟回答和引用片段，帮助你理解接口结构。
"""


def answer_question(question: str) -> dict:
    return {
        "question": question,
        "answer": "模拟回答：RAG API 会根据文档片段回答问题。",
        "references": [DOCUMENT.strip()],
    }
