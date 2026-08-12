# -*- coding: utf-8 -*-
"""文章总结工具。"""


from pathlib import Path
import sys

COMMON_DIR = Path(__file__).resolve().parents[1] / "common"
sys.path.append(str(COMMON_DIR))

from mock_llm import ask_mock_llm, summarize_paper



def main():
    article = Path(__file__).parent / "data" / "article.txt"
    text = article.read_text(encoding="utf-8")
    prompt = "请总结这篇文章：\n" + text
    print(ask_mock_llm(prompt))


if __name__ == "__main__":
    main()
