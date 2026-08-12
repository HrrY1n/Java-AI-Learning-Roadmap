# -*- coding: utf-8 -*-
"""Prompt 模板。"""


from pathlib import Path
import sys

COMMON_DIR = Path(__file__).resolve().parents[1] / "common"
sys.path.append(str(COMMON_DIR))

from mock_llm import ask_mock_llm, summarize_paper



def build_prompt(role, task, text):
    return f"你是{role}。请完成任务：{task}。\n输入文本：{text}"


def main():
    prompt = build_prompt("论文阅读助手", "总结研究问题", "本文研究 RAG 文档问答。")
    print(prompt)
    print(ask_mock_llm(prompt))


if __name__ == "__main__":
    main()
