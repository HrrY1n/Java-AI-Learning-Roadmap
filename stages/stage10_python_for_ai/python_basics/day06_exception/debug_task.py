# -*- coding: utf-8 -*-
"""Day 06 Debug 任务：修复异常处理逻辑。"""

import json


def main():
    text = '{"top_k": 3, "min_score": 0.5}'
    config = json.loads(text)

    # Bug 1: key 不存在，会触发 KeyError。
    print(config["max_score"])

    # Bug 2: int(None) 会触发 TypeError。
    top_k = int(config.get("missing_top_k"))
    print(top_k)

    # Bug 3: except 类型写得太窄，捕获不到 TypeError。
    try:
        score = float(None)
    except ValueError:
        score = 0.0
    print(score)


if __name__ == "__main__":
    main()

# 提示：不要把所有错误都写成 except Exception，先判断具体异常类型。
