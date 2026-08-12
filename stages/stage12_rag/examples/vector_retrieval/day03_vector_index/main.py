# -*- coding: utf-8 -*-
"""Build a vector index with the sklearn fallback."""


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
    texts = ["RAG retrieves document chunks.", "FastAPI provides an API.", "Streamlit shows a web page."]
    store.add_texts(texts)
    print("Index built. Document count:", len(texts))


if __name__ == "__main__":
    main()
