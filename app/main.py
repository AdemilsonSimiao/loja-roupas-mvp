from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import Base, SessionLocal, engine
from app.models import Produto, Variacao

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Loja de Roupas MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:8001", "http://localhost:8001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VariacaoInput(BaseModel):
    tamanho: str = Field(..., min_length=1, max_length=10)
    cor: str = Field(..., min_length=1, max_length=30)
    estoque: int = Field(default=0, ge=0)


class ProdutoInput(BaseModel):
    nome: str = Field(..., min_length=1, max_length=120)
    descricao: Optional[str] = Field(default=None, max_length=500)
    preco_centavos: int = Field(..., ge=0)
    foto_url: Optional[str] = Field(default=None, max_length=300)
    variacoes: list[VariacaoInput] = []


def criar_produtos_iniciais(session: Session):
    if session.scalar(select(Produto.id).limit(1)) is not None:
        return

    produto = Produto(
        nome="Vestido Midi",
        descricao="Vestido leve para ocasiões casuais.",
        preco_centavos=12990,
        foto_url="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
        variacoes=[
            Variacao(tamanho="P", cor="Preto", estoque=3),
            Variacao(tamanho="M", cor="Preto", estoque=5),
        ],
    )
    session.add(produto)
    session.commit()


@app.get("/saude")
def saude():
    return {"status": "ok"}


@app.get("/produtos")
def listar_produtos():
    with SessionLocal() as session:
        criar_produtos_iniciais(session)
        produtos = session.scalars(select(Produto).order_by(Produto.id)).all()

        return [
            {
                "id": produto.id,
                "nome": produto.nome,
                "descricao": produto.descricao,
                "preco_centavos": produto.preco_centavos,
                "foto_url": produto.foto_url,
                "variacoes": [
                    {
                        "id": variacao.id,
                        "tamanho": variacao.tamanho,
                        "cor": variacao.cor,
                        "estoque": variacao.estoque,
                    }
                    for variacao in produto.variacoes
                ],
            }
            for produto in produtos
        ]


@app.post("/produtos")
def criar_produto(produto_input: ProdutoInput):
    with SessionLocal() as session:
        produto = Produto(
            nome=produto_input.nome,
            descricao=produto_input.descricao,
            preco_centavos=produto_input.preco_centavos,
            foto_url=produto_input.foto_url,
            variacoes=[
                Variacao(
                    tamanho=variacao.tamanho,
                    cor=variacao.cor,
                    estoque=variacao.estoque,
                )
                for variacao in produto_input.variacoes
            ],
        )
        session.add(produto)
        session.commit()
        session.refresh(produto)

        return {
            "id": produto.id,
            "nome": produto.nome,
            "descricao": produto.descricao,
            "preco_centavos": produto.preco_centavos,
            "foto_url": produto.foto_url,
            "variacoes": [
                {
                    "id": variacao.id,
                    "tamanho": variacao.tamanho,
                    "cor": variacao.cor,
                    "estoque": variacao.estoque,
                }
                for variacao in produto.variacoes
            ],
        }


@app.get("/produtos/{produto_id}")
def buscar_produto(produto_id: int):
    with SessionLocal() as session:
        produto = session.get(Produto, produto_id)

        if produto is None:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        return {
            "id": produto.id,
            "nome": produto.nome,
            "descricao": produto.descricao,
            "preco_centavos": produto.preco_centavos,
            "foto_url": produto.foto_url,
            "variacoes": [
                {
                    "id": variacao.id,
                    "tamanho": variacao.tamanho,
                    "cor": variacao.cor,
                    "estoque": variacao.estoque,
                }
                for variacao in produto.variacoes
            ],
        }


@app.put("/produtos/{produto_id}")
def atualizar_produto(produto_id: int, produto_input: ProdutoInput):
    with SessionLocal() as session:
        produto = session.get(Produto, produto_id)

        if produto is None:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        produto.nome = produto_input.nome
        produto.descricao = produto_input.descricao
        produto.preco_centavos = produto_input.preco_centavos
        produto.foto_url = produto_input.foto_url

        for variacao in list(produto.variacoes):
            session.delete(variacao)

        produto.variacoes = [
            Variacao(
                tamanho=variacao.tamanho,
                cor=variacao.cor,
                estoque=variacao.estoque,
            )
            for variacao in produto_input.variacoes
        ]

        session.commit()
        session.refresh(produto)

        return {
            "id": produto.id,
            "nome": produto.nome,
            "descricao": produto.descricao,
            "preco_centavos": produto.preco_centavos,
            "foto_url": produto.foto_url,
            "variacoes": [
                {
                    "id": variacao.id,
                    "tamanho": variacao.tamanho,
                    "cor": variacao.cor,
                    "estoque": variacao.estoque,
                }
                for variacao in produto.variacoes
            ],
        }


@app.delete("/produtos/{produto_id}")
def remover_produto(produto_id: int):
    with SessionLocal() as session:
        produto = session.get(Produto, produto_id)

        if produto is None:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        for variacao in list(produto.variacoes):
            session.delete(variacao)

        session.delete(produto)
        session.commit()

        return {"message": "Produto removido com sucesso"}