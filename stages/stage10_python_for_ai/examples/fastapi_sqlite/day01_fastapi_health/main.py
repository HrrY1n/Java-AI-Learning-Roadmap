# -*- coding: utf-8 -*-
"""GET /health 示例。"""

from fastapi import FastAPI

app = FastAPI(title="Health API")


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
