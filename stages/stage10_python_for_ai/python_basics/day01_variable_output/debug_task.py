# -*- coding: utf-8 -*-
"""Day 01 Debug 任务：运行后根据报错修复。"""


def main():
    learner_name = "Yan"
    study_hours = "2.5"
    finished_tasks = 3
    total_tasks = 4

    # Bug 1: 变量名写错。
    print(f"学习者：{learner_name}")

    # Bug 2: 字符串不能直接和数字相加。
    next_hours = float(study_hours) + 1
    print(f"明天计划学习：{next_hours} 小时")

    # Bug 3: 逻辑错误，完成率应该是 finished_tasks / total_tasks。
    rate = finished_tasks / total_tasks
    print(f"完成率：{rate:.0%}")


if __name__ == "__main__":
    main()

# 提示：不要直接看答案。先运行文件，读报错行号，再逐个修复。
