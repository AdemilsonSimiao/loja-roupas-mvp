# Clothing Store MVP

A simple MVP for a clothing store built with Python and FastAPI. The project is intended to serve as a foundation for a small online store with product listing and a basic API layer.

## Project objective

Create a lightweight backend that exposes a catalog of products and provides health and catalog endpoints for a future frontend integration.

## Features

- FastAPI backend
- Product catalog endpoint
- Health check endpoint
- Clean project structure for future expansion

## Project structure

```text
loja-roupas-mvp/
├── .gitignore
├── requirements.txt
├── README.md
└── app/
    ├── __init__.py
    └── main.py
```

## Requirements

- Python 3.10+
- pip

## Installation

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Running the app

```bash
uvicorn app.main:app --reload
```

Then open:

- http://127.0.0.1:8000/
- http://127.0.0.1:8000/health

## Future improvements

- Product catalog with categories and prices
- Shopping cart and checkout flow
- Authentication for admin and clients
- Database integration
- Frontend interface

## License

This project is for study and portfolio purposes.