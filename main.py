import sys
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from server.routers import dashboard
from server.routers import request

app = FastAPI(title="Shop Assistant")

STATIC_DIR = Path(__file__).parent / "static"


@app.get("/api/health")
def health():
    return {"ok": True, "python": sys.version}

app.include_router(dashboard.router, prefix="/api")
app.include_router(request.router , prefix="/api")
# Must stay last: this claims every path the API routes above did not.
app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")