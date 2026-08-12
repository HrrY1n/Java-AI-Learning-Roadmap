# -*- coding: utf-8 -*-
"""小项目：给 RAG 系统提供简单 API。"""

from fastapi import FastAPI
from pydantic import BaseModel
from rag_core import answer_question

app = FastAPI(title="Simple RAG API")


class AskRequest(BaseModel):
    question: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask")
def ask(request: AskRequest):
    return answer_question(request.question)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
