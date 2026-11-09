from fastapi import FastAPI

from app import models
from app.database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Loja de Roupas MVP")


@app.get("/saude")
def saude():
    return {"status": "ok"}