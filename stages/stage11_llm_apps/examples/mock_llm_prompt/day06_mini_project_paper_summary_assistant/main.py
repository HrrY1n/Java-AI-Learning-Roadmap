# -*- coding: utf-8 -*-
"""小项目：论文摘要总结助手。"""


from pathlib import Path
import sys

COMMON_DIR = Path(__file__).resolve().parents[1] / "common"
sys.path.append(str(COMMON_DIR))

from mock_llm import ask_mock_llm, summarize_paper



def main():
    paper_path = Path(__file__).parent / "data" / "sample_paper.txt"
    text = paper_path.read_text(encoding="utf-8")
    result = summarize_paper(text)

    print("论文摘要总结助手输出：\n")
    for title, content in result.items():
        print(f"## {title}")
        print(content)
        print()


if __name__ == "__main__":
    main()
