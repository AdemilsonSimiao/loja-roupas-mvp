import unittest

from fastapi.testclient import TestClient

from app.main import app


class ProdutoRouteTest(unittest.TestCase):
    def test_listar_produtos(self):
        client = TestClient(app)
        response = client.get("/produtos")

        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json(), list)


if __name__ == "__main__":
    unittest.main()
