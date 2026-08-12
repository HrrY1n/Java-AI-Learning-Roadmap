# -*- coding: utf-8 -*-
"""生成 markdown 评测报告。"""

from pathlib import Path


def main():
    report = """# RAG 问答质量评测报告

    ## 样本概况

    - 样本数：2
    - 检查项：引用正确性、幻觉检测、错误引用分析

    ## 结论

    当前样本整体可复查，但仍需要增加更多授权测试样本。
    """
    path = Path(__file__).parent / "reports" / "eval_report.md"
    path.parent.mkdir(exist_ok=True)
    path.write_text(report, encoding="utf-8")
    print("已生成：", path)


if __name__ == "__main__":
    main()
