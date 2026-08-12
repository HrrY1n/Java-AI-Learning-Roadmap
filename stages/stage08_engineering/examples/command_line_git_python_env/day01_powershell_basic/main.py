# -*- coding: utf-8 -*-
"""PowerShell 常用命令速览。"""


def main():
    commands = [
        ("pwd", "查看当前目录"),
        ("ls", "列出文件"),
        ("cd 目录名", "进入目录"),
        ("mkdir 新目录", "创建目录"),
        ("python --version", "查看 Python 版本"),
    ]
    for cmd, desc in commands:
        print(f"{cmd:<20} # {desc}")


if __name__ == "__main__":
    main()
