# -*- coding: utf-8 -*-
"""Day 02 示例：管理论文元数据并筛选 RAG 论文。"""


def main():
    papers = [
        {
            "title": "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
            "year": 2020,
            "authors": ["Patrick Lewis", "Ethan Perez"],
            "keywords": ["RAG", "retrieval", "generation"],
        },
        {
            "title": "Attention Is All You Need",
            "year": 2017,
            "authors": ["Ashish Vaswani"],
            "keywords": ["Transformer", "attention"],
        },
        {
            "title": "Evaluation Methods for RAG Question Answering",
            "year": 2024,
            "authors": ["Example Author"],
            "keywords": ["RAG", "evaluation", "question answering"],
        },
    ]

    print("=== 论文列表 ===")
    for index, paper in enumerate(papers, start=1):
        title = paper["title"]
        year = paper["year"]
        keyword_text = ", ".join(paper["keywords"])
        print(f"{index}. {title} ({year}) - {keyword_text}")

    print("\n=== 包含 RAG 的论文 ===")
    rag_papers = []
    for paper in papers:
        title_has_rag = "rag" in paper["title"].lower()
        keyword_has_rag = "rag" in [kw.lower() for kw in paper["keywords"]]
        if title_has_rag or keyword_has_rag:
            rag_papers.append(paper)
            print(f"- {paper['title']}")

    keyword_counts = {}
    for paper in papers:
        for keyword in paper["keywords"]:
            normalized = keyword.lower()
            keyword_counts[normalized] = keyword_counts.get(normalized, 0) + 1

    print("\n=== 关键词频率 ===")
    for keyword, count in sorted(keyword_counts.items()):
        print(f"{keyword}: {count}")


if __name__ == "__main__":
    main()
