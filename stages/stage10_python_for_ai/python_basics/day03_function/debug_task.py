# -*- coding: utf-8 -*-
"""Day 03 Debug 任务：修复函数返回值和参数问题。"""


def clean_text(text):
    cleaned = " ".join(text.strip().split())
    print(cleaned)  # Bug 1: 这里应该 return，不应该只 print。


def count_keyword(text, keyword):
    return text.lower().count(keywords.lower())  # Bug 2: 变量名写错。


def main():
    raw_text = "  RAG uses retrieval.  "
    cleaned = clean_text(raw_text)
    print("清洗后长度：", len(cleaned))  # Bug 3: cleaned 现在是 None。
    print(count_keyword(raw_text))  # Bug 4: 少传了 keyword 参数。


if __name__ == "__main__":
    main()

# 提示：重点观察 TypeError 和 NameError，理解 print 与 return 的区别。
