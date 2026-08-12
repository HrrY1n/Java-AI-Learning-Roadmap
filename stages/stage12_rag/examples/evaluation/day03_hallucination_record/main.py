# -*- coding: utf-8 -*-
"""记录可能的幻觉回答。"""

from pathlib import Path
import json


def main():
    record = {
        "question": "文档是否提到 FAISS？",
        "answer": "回答中提到了文档没有明确说明的内容。",
        "risk_type": "幻觉检测",
        "note": "需要人工复查引用片段。",
    }
    path = Path(__file__).parent / "output" / "risk_records.json"
    path.parent.mkdir(exist_ok=True)
    path.write_text(json.dumps([record], ensure_ascii=False, indent=2), encoding="utf-8")
    print("已保存：", path)


if __name__ == "__main__":
    main()
