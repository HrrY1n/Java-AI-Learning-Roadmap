# -*- coding: utf-8 -*-
"""Day 01 基础练习：补全 TODO，生成结构化输出。"""


def exercise_1():
    """输入：姓名和方向。输出：一行自我介绍。"""
    name = "你的名字"  # TODO: 改成你的名字
    direction = "AI 应用开发实习"  # TODO: 改成你的方向
    # TODO: 用 f-string 输出：我是 xxx，正在准备 xxx。
    print(f"我叫{name}，我的方向是{direction}")


def exercise_2():
    """输入：任务数量。输出：完成率。"""
    finished = 2
    total = 5
    # TODO: 计算完成率，并用百分比格式输出，例如 40%。
    comp = finished / total
    print(f"完成率是（{comp:.0%}）")


def exercise_3():
    """输入：一段用户问题。输出：清洗后的问题。"""
    question = "   什么是 RAG 检索增强生成？   "
    # TODO: 去掉首尾空格，并输出清洗前后的长度。
    print(question.strip())


def exercise_4():
    """输入：日报字段。输出：Markdown 格式学习日报。"""
    topic = "Python 字符串"
    hours = 1.75
    task = "完成 day01 practice.py"
    # TODO: 输出 3 行 Markdown，包含 topic、hours、task。
    print(f'''
今天任务：{topic}
学习时间：{hours}
水水水水：{task}
    ''')


def main():
    exercise_1()
    exercise_2()
    exercise_3()
    exercise_4()


if __name__ == "__main__":
    main()
