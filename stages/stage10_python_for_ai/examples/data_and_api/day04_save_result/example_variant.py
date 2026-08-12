# -*- coding: utf-8 -*-
"""练习：把字典保存成 JSON。"""

from pathlib import Path
import json


def main():
    result = {"task": "save_result", "done": True}
    path = Path(__file__).parent / "output" / "practice_result.json"
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(path)


if __name__ == "__main__":
    main()
