# -*- coding: utf-8 -*-
"""小项目：RAG 问答质量评测工具。"""

from pathlib import Path
from evaluator import evaluate_samples, build_markdown_report


def main():
    samples = [
        {
            "question": "RAG 的流程是什么？",
            "answer": "RAG 会读取文档、检索相关片段并生成回答。",
            "references": ["读取文档", "检索相关片段"],
        },
        {
            "question": "系统是否保存历史？",
            "answer": "系统一定保存了完整数据库记录。",
            "references": ["示例主要展示问答流程"],
        },
    ]
    results = evaluate_samples(samples)
    report = build_markdown_report(results)
    output = Path(__file__).parent / "reports" / "quality_report.md"
    output.parent.mkdir(exist_ok=True)
    output.write_text(report, encoding="utf-8")
    print("评测完成：", output)
    print(report)


if __name__ == "__main__":
    main()
