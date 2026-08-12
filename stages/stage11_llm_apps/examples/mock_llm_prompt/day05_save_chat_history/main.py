# -*- coding: utf-8 -*-
"""保存问答记录。"""


from pathlib import Path
import sys

COMMON_DIR = Path(__file__).resolve().parents[1] / "common"
sys.path.append(str(COMMON_DIR))

from mock_llm import ask_mock_llm, summarize_paper

import json


def main():
    output = Path(__file__).parent / "output" / "chat_history.json"
    output.parent.mkdir(exist_ok=True)
    question = "RAG 项目为什么适合写进简历？"
    answer = ask_mock_llm(question)
    history = [{"question": question, "answer": answer}]
    output.write_text(json.dumps(history, ensure_ascii=False, indent=2), encoding="utf-8")
    print("已保存：", output)


if __name__ == "__main__":
    main()
