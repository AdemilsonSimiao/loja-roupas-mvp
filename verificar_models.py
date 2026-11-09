from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.database import Base
from app.models import Produto, Variacao

# Banco temporario, só na memória: não mexe no seu loja.db
engine = create_engine("sqlite://")
Base.metadata.create_all(bind=engine)

with Session(engine) as sessao:
    vestido = Produto(nome="Vestido Midi", preco_centavos=12990)
    vestido.variacoes = [
        Variacao(tamanho="P", cor="Preto", estoque=3),
        Variacao(tamanho="M", cor="Preto", estoque=5),
    ]
    sessao.add(vestido)
    sessao.commit()

    lido = sessao.scalars(select(Produto)).first()
    print(f"{lido.nome} - R$ {lido.preco_centavos / 100:.2f}")
    for v in lido.variacoes:
        print(f"  {v.tamanho} / {v.cor}: {v.estoque} em estoque")