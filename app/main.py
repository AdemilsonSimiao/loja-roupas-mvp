from fastapi import FastAPI

app = FastAPI(title="Loja de Roupas MVP")


@app.get("/")
def read_root():
    return {"message": "Welcome to the clothing store MVP"}


@app.get("/health")
def health_check():
    return {"status": "ok"}
