# -*- coding: utf-8 -*-
"""RAG 问答质量评测工具。"""


def reference_hit(answer, references):
    return any(ref in answer for ref in references)


def evaluate_sample(sample):
    hit = reference_hit(sample["answer"], sample["references"])
    risk = "低" if hit else "需要复查"
    return {
        "question": sample["question"],
        "reference_hit": hit,
        "risk_level": risk,
        "note": "引用命中" if hit else "可能存在错误引用或幻觉风险",
    }


def evaluate_samples(samples):
    return [evaluate_sample(sample) for sample in samples]


def build_markdown_report(results):
    lines = [
        "# RAG 问答质量评测报告",
        "",
        "## 评测维度",
        "",
        "- 问答质量评测",
        "- 幻觉检测",
        "- 错误引用分析",
        "- 风险样本测试",
        "- 安全评估",
        "- 授权测试样本",
        "",
        "## 样本结果",
        "",
    ]
    for index, item in enumerate(results, start=1):
        lines.extend(
            [
                f"### 样本 {index}",
                "",
                f"- 问题：{item['question']}",
                f"- 引用命中：{item['reference_hit']}",
                f"- 风险等级：{item['risk_level']}",
                f"- 备注：{item['note']}",
                "",
            ]
        )
    return "\n".join(lines)
