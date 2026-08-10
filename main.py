import sys

from fastapi import FastAPI

app = FastAPI(title="Shop Assistant")


@app.get("/api/health")
def health():
    return {"ok": True, "python": sys.version}