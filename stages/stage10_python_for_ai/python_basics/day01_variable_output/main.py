# -*- coding: utf-8 -*-
"""Day 01 示例：生成一份 AI/RAG 学习日报。"""


def main():
    # 这些变量模拟你每天记录的学习信息。
    learner_name = "Yan"
    direction = "RAG 文档问答实习"
    today_topic = "Python 变量、字符串与格式化输出"
    study_hours = 2.5
    completed_tasks = 3
    total_tasks = 4
    blocker = "还不熟悉 f-string 的格式控制"

    # 字符串方法常用于清洗用户输入或 API 返回文本。
    raw_question = "   What is RAG?   "
    cleaned_question = raw_question.strip()
    normalized_question = cleaned_question.lower()

    completion_rate = completed_tasks / total_tasks

    # 用 f-string 生成 Markdown，后续报告和 Prompt 都会用到这个能力。
    report = f"""
# 学习日报

- 学习者：{learner_name}
- 求职方向：{direction}
- 今日主题：{today_topic}
- 学习时长：{study_hours:.1f} 小时
- 任务进度：{completed_tasks}/{total_tasks} ({completion_rate:.0%})
- 今日卡点：{blocker}

## 用户问题清洗示例

- 原始问题：{raw_question!r}
- 去掉首尾空格：{cleaned_question}
- 转成小写：{normalized_question}
"""

    print(report.strip())


if __name__ == "__main__":
    main()
