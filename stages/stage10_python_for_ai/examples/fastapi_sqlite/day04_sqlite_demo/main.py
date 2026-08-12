# -*- coding: utf-8 -*-
"""用 sqlite 保存问答历史。"""

from pathlib import Path
import sqlite3


def main():
    db_path = Path(__file__).parent / "qa_history.db"
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute(
        "CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, answer TEXT)"
    )
    cur.execute(
        "INSERT INTO history(question, answer) VALUES(?, ?)",
        ("RAG 是什么？", "RAG 是检索增强生成。"),
    )
    conn.commit()

    for row in cur.execute("SELECT id, question, answer FROM history ORDER BY id DESC LIMIT 5"):
        print(row)
    conn.close()
    print("数据库：", db_path)


if __name__ == "__main__":
    main()
