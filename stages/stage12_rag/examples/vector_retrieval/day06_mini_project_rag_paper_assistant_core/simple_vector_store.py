# -*- coding: utf-8 -*-
"""Windows 友好的向量检索 fallback：使用 sklearn TF-IDF + 余弦相似度。"""

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
            raise ValueError("请先调用 add_texts。")
        query_vector = self.vectorizer.transform([query])
        scores = cosine_similarity(query_vector, self.matrix)[0]
        ranked_indexes = scores.argsort()[::-1][:top_k]
        return [
            {"text": self.texts[index], "score": float(scores[index])}
            for index in ranked_indexes
        ]
