# -*- coding: utf-8 -*-
"""Day 03 示例：封装文本清洗、关键词统计和 Prompt 构造。"""


def clean_text(text):
    """清洗文本：去掉首尾空格，把多个换行替换成一个空格。"""
    return " ".join(text.strip().split())


def count_keywords(text, keywords):
    """统计关键词出现次数，返回 dict。"""
    lower_text = text.lower()
    result = {}
    for keyword in keywords:
        result[keyword] = lower_text.count(keyword.lower())
    return result


def build_prompt(question, context):
    """构造一个简单 RAG Prompt。"""
    return f"""你是论文阅读助手。请只根据给定上下文回答问题。

上下文：
{context}

问题：
{question}

回答："""


def summarize_text(text):
    """返回文本统计信息，而不是只 print。"""
    cleaned = clean_text(text)
    return {
        "characters": len(cleaned),
        "words": len(cleaned.split()),
        "preview": cleaned[:60],
    }


def main():
    raw_text = """
        RAG retrieves relevant document chunks.
        The prompt combines context and user question.
    """
    question = "RAG 的 Prompt 中应该包含什么？"
    keywords = ["RAG", "prompt", "context"]

    cleaned = clean_text(raw_text)
    stats = summarize_text(raw_text)
    keyword_counts = count_keywords(cleaned, keywords)
    prompt = build_prompt(question, cleaned)

    print("=== 清洗后文本 ===")
    print(cleaned)
    print("\n=== 文本统计 ===")
    print(stats)
    print("\n=== 关键词统计 ===")
    print(keyword_counts)
    print("\n=== Prompt ===")
    print(prompt)


if __name__ == "__main__":
    main()
