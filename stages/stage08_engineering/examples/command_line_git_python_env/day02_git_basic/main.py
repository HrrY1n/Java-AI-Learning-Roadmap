# -*- coding: utf-8 -*-
"""Git 基础工作流说明。"""


def main():
    steps = [
        "git status",
        "git add 文件名",
        "git commit -m \"说明本次修改\"",
        "git push",
    ]
    print("常见 Git 提交流程：")
    for step in steps:
        print(step)


if __name__ == "__main__":
    main()
