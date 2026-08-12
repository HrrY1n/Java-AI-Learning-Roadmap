# -*- coding: utf-8 -*-
"""检查回答是否引用了正确片段。"""


def check_reference(answer, references):
    return any(ref.lower() in answer.lower() for ref in references)


def main():
    answer = "RAG 会先检索相关片段，再生成回答。"
    references = ["检索相关片段", "无关内容"]
    print("引用检查：", check_reference(answer, references))


if __name__ == "__main__":
    main()
