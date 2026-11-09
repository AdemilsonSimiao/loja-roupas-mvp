from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nome: Mapped[str] = mapped_column(String(120))
    descricao: Mapped[str | None] = mapped_column(String(500), default=None)
    preco_centavos: Mapped[int]
    foto_url: Mapped[str | None] = mapped_column(String(300), default=None)

    variacoes: Mapped[list["Variacao"]] = relationship(back_populates="produto")


class Variacao(Base):
    __tablename__ = "variacoes"

    id: Mapped[int] = mapped_column(primary_key=True)
    produto_id: Mapped[int] = mapped_column(ForeignKey("produtos.id"))
    tamanho: Mapped[str] = mapped_column(String(10))
    cor: Mapped[str] = mapped_column(String(30))
    estoque: Mapped[int] = mapped_column(default=0)

    produto: Mapped["Produto"] = relationship(back_populates="variacoes")