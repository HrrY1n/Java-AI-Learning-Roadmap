# -*- coding: utf-8 -*-
"""模拟大模型调用。"""


from pathlib import Path
import sys

COMMON_DIR = Path(__file__).resolve().parents[1] / "common"
sys.path.append(str(COMMON_DIR))

from mock_llm import ask_mock_llm, summarize_paper



def main():
    prompt = "请用一句话解释 RAG 是什么。"
    answer = ask_mock_llm(prompt)
    print("Prompt:", prompt)
    print("Answer:", answer)


if __name__ == "__main__":
    main()
