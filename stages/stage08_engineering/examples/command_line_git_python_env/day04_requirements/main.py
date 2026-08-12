# -*- coding: utf-8 -*-
"""读取项目根目录 requirements.txt。"""

from pathlib import Path


def main():
    requirements = Path(__file__).resolve().parents[5] / "requirements.txt"
    print("依赖文件：", requirements)
    for line in requirements.read_text(encoding="utf-8").splitlines():
        if line.strip() and not line.startswith("#"):
            print("-", line)


if __name__ == "__main__":
    main()
