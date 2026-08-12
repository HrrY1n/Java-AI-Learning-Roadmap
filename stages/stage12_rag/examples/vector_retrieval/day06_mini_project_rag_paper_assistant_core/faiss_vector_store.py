# -*- coding: utf-8 -*-
"""FAISS 版本示例。

如果 Windows 上安装 FAISS 不顺利，请先使用 simple_vector_store.py。
"""

import numpy as np


class FaissVectorStore:
    def __init__(self):
        try:
            import faiss
        except ImportError as exc:
            raise ImportError("当前环境没有安装 faiss，请先使用 simple_vector_store.py。") from exc
        self.faiss = faiss
        self.index = None
        self.texts = []

    def add_vectors(self, texts, vectors):
        self.texts = list(texts)
        vectors = np.array(vectors).astype("float32")
        self.index = self.faiss.IndexFlatL2(vectors.shape[1])
        self.index.add(vectors)

    def search(self, vector, top_k=3):
        if self.index is None:
            raise ValueError("请先调用 add_vectors。")
        query = np.array([vector]).astype("float32")
        distances, indexes = self.index.search(query, top_k)
        return [
            {"text": self.texts[index], "distance": float(distances[0][rank])}
            for rank, index in enumerate(indexes[0])
        ]
