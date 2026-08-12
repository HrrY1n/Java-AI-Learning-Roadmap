# -*- coding: utf-8 -*-
"""SQL 基础：SELECT / WHERE / ORDER BY / GROUP BY / JOIN。"""

import sqlite3


def main():
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()
    cur.execute("CREATE TABLE qa(id INTEGER PRIMARY KEY, tag TEXT, score INTEGER)")
    cur.executemany(
        "INSERT INTO qa(tag, score) VALUES(?, ?)",
        [("RAG", 90), ("Python", 85), ("RAG", 95), ("SQL", 80)],
    )

    print("WHERE + ORDER BY:")
    for row in cur.execute("SELECT tag, score FROM qa WHERE score >= 85 ORDER BY score DESC"):
        print(row)

    print("\nGROUP BY:")
    for row in cur.execute("SELECT tag, COUNT(*) FROM qa GROUP BY tag"):
        print(row)

    conn.close()


if __name__ == "__main__":
    main()
