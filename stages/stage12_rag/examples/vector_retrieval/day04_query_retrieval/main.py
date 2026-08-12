# -*- coding: utf-8 -*-
"""Retrieve chunks for a question."""


from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class SimpleVectorStore:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()
        self.texts = []
        self.matrix = None

    def add_texts(self, texts):
        self.texts = list(texts)
        self.matrix = self.vectorizer.fit_transform(self.texts)

    def search(self, query, top_k=3):
        if self.matrix is None:
            raise ValueError("Call add_texts before search.")
        query_vector = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vector, self.matrix)[0]
        ranked_indexes = scores.argsort()[::-1][:top_k]
        return [
            {"text": self.texts[index], "score": float(scores[index])}
            for index in ranked_indexes
        ]



def main():
    store = SimpleVectorStore()
    store.add_texts(["RAG uses vector retrieval.", "SQLite can save chat history.", "Prompt templates organize context."])
    results = store.search("How does RAG retrieve context?", top_k=2)
    for item in results:
        print(item)


if __name__ == "__main__":
    main()
