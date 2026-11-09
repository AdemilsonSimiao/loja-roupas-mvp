# Clothing Store MVP

This project is a lightweight MVP for an online clothing store. It uses FastAPI as the backend framework and SQLAlchemy with SQLite to manage product data in a simple and extensible way.

## Project goal

Create a functional backend foundation for a fashion storefront, including a health endpoint and a product model that can be expanded into a catalog, shopping cart, and checkout flow.

## Current features

- FastAPI application setup
- SQLite database connection
- SQLAlchemy model for products
- Health endpoint for service validation
- Simple structure ready for future API and frontend expansion

## Project structure

```text
loja-roupas-mvp/
├── .gitignore
├── .venv/
├── README.md
├── requirements.txt
├── loja.db
└── app/
    ├── __init__.py
    ├── database.py
    ├── main.py
    └── models.py
```

## Technologies

- Python 3.10+
- FastAPI
- SQLAlchemy
- SQLite

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running the application

```bash
uvicorn app.main:app --reload
```

Then access:

- http://127.0.0.1:8000/docs
- http://127.0.0.1:8000/saude

## Product model

The current product record includes:

- id
- nome
- descricao
- preco_centavos
- foto_url

This makes it easy to expand the catalog and integrate items into the store front.

## Future improvements

- Product listing and detail routes
- Create, update, and delete product endpoints
- Product categories and filters
- Shopping cart and checkout flow
- User authentication
- Admin panel
- Frontend interface

## License

This project is intended for study and portfolio use.