# -*- coding: utf-8 -*-
"""简单多轮对话。"""


from pathlib import Path
import sys

COMMON_DIR = Path(__file__).resolve().parents[1] / "common"
sys.path.append(str(COMMON_DIR))

from mock_llm import ask_mock_llm, summarize_paper



def main():
    history = []
    questions = ["RAG 是什么？", "为什么要显示引用片段？"]
    for question in questions:
        history.append({"role": "user", "content": question})
        prompt = "\n".join(item["content"] for item in history)
        answer = ask_mock_llm(prompt)
        history.append({"role": "assistant", "content": answer})

    for item in history:
        print(f'{item["role"]}: {item["content"]}')


if __name__ == "__main__":
    main()
