# -*- coding: utf-8 -*-
"""A complete simple RAG pipeline."""


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
    chunks = [
        "The first step of RAG is loading and splitting documents.",
        "The retriever finds chunks related to the question.",
        "The prompt combines the question and the retrieved chunks.",
    ]
    store = SimpleVectorStore()
    store.add_texts(chunks)
    question = "What does the retriever do in RAG?"
    contexts = store.search(question, top_k=2)
    print("Question:", question)
    print("Mock answer: the retriever finds relevant chunks as evidence.")
    print("References:")
    for item in contexts:
        print(item)


if __name__ == "__main__":
    main()
