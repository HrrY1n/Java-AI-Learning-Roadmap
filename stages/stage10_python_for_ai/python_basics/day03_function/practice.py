# -*- coding: utf-8 -*-
"""Day 03 基础练习：补全文本处理函数。"""


def clean_text(text):
    """输入：带多余空格的文本。输出：清洗后的文本。"""
    # TODO: 使用 strip 和 split/join 去掉多余空白。
    return text


def count_keyword(text, keyword):
    """输入：文本和关键词。输出：关键词出现次数。"""
    # TODO: 忽略大小写统计 keyword 出现次数。
    return 0


def build_prompt(question, context):
    """输入：问题和上下文。输出：Prompt 字符串。"""
    # TODO: 返回包含“上下文”和“问题”的字符串。
    return "TODO"


def build_result(text, keywords):
    """输入：文本和关键词列表。输出：结构化统计 dict。"""
    # TODO: 返回 {'length': ..., 'keyword_counts': ...}
    return {}


def main():
    text = "   RAG uses retrieval. Retrieval gives context.   "
    keywords = ["RAG", "retrieval", "context"]
    print(clean_text(text))
    print(count_keyword(text, "retrieval"))
    print(build_prompt("RAG 为什么需要检索？", clean_text(text)))
    print(build_result(text, keywords))


if __name__ == "__main__":
    main()
