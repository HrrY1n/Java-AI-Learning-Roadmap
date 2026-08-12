# -*- coding: utf-8 -*-
"""一个不需要 API Key 的假模型，用来模拟大模型回答。"""


def ask_mock_llm(prompt: str) -> str:
    """根据 prompt 返回一个可预测的模拟回答。"""
    prompt_lower = prompt.lower()
    if "论文" in prompt or "paper" in prompt_lower or "摘要" in prompt:
        return (
            "模拟回答：这篇文章围绕 RAG 文档问答展开，重点包括背景、问题、方法、"
            "创新点、局限性和可继续追问的问题。"
        )
    if "总结" in prompt or "summary" in prompt_lower:
        return "模拟回答：文本的核心是把复杂内容压缩成结构化要点。"
    if "引用片段" in prompt or "context" in prompt_lower:
        return "模拟回答：我会优先依据给定引用片段回答，并标明依据。"
    return "模拟回答：这是 mock LLM 的返回结果。以后可以替换成真实模型 API。"


def summarize_paper(text: str) -> dict:
    """返回固定结构，帮助你先理解论文总结工具的输出形状。"""
    preview = text.strip().replace("\n", " ")[:80]
    return {
        "研究背景": f"文章背景与 AI 文档处理相关。原文片段：{preview}",
        "研究问题": "如何让模型回答时参考指定文档，而不是只依赖通用知识。",
        "方法": "将文档切分、检索相关片段，再把片段放入 Prompt 中生成回答。",
        "创新点": "把文档问答流程拆成可解释、可评测的模块。",
        "局限性": "mock 模型不具备真实理解能力，后续需要接入真实 API 和向量模型。",
        "可以继续追问的问题": "检索片段是否准确？回答是否引用了正确依据？",
    }
