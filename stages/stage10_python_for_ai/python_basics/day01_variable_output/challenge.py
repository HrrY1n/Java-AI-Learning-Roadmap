# -*- coding: utf-8 -*-
"""Day 01 进阶练习：生成多天学习日志摘要。"""


def main():
    day1_topic = "变量与字符串"
    day1_hours = 2.0
    day2_topic = "列表与字典"
    day2_hours = 2.5
    day3_topic = "函数"
    day3_hours = 1.5

    total_hours = day1_hours + day2_hours + day3_hours
    average_hours = total_hours / 3

    # TODO: 把下面输出改造成 Markdown 表格。
    print("# 三天学习摘要")
    print(f"总时长：{total_hours:.1f} 小时")
    print(f"平均每天：{average_hours:.1f} 小时")
    print(f"主题：{day1_topic}, {day2_topic}, {day3_topic}")


if __name__ == "__main__":
    main()
