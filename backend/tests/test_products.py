import pytest

class TestProducts:
    def test_get_products_feed_basic(self, client):
        """Тест базового получения ленты товаров"""
        response = client.get("/products/feed")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "message" in data
        assert "data" in data
        assert "products" in data["data"]

    def test_get_products_feed_with_pagination(self, client):
        """Тест пагинации в ленте товаров"""
        response = client.get("/products/feed?offset=10&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["offset"] == 10
        assert data["data"]["limit"] == 5

    def test_get_products_feed_with_search(self, client):
        """Тест поиска в ленте товаров"""
        response = client.get("/products/feed?search=test")
        assert response.status_code == 200

    def test_get_products_feed_with_category_filter(self, client):
        """Тест фильтрации по категории"""
        response = client.get("/products/feed?category=electronics")
        assert response.status_code == 200

    def test_get_products_feed_with_location(self, client):
        """Тест с координатами пользователя"""
        response = client.get("/products/feed?user_lat=55.7558&user_long=37.6173")
        assert response.status_code == 200

    def test_get_products_feed_invalid_limit(self, client):
        """Тест с невалидным лимитом"""
        response = client.get("/products/feed?limit=150")  # Превышает maximum
        assert response.status_code == 422

    def test_get_products_feed_negative_offset(self, client):
        """Тест с отрицательным offset"""
        response = client.get("/products/feed?offset=-1")
        assert response.status_code == 422

    def test_get_categories(self, client):
        """Тест получения категорий"""
        response = client.get("/products/categories")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "categories" in data["data"]

    def test_get_merchants(self, client):
        """Тест получения списка мерчантов"""
        response = client.get("/products/merchants")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "merchants" in data["data"]

    def test_get_product_offers_success(self, client):
        """Тест получения предложений для товара"""
        response = client.get("/products/1234567890123/offers?user_lat=55.7558&user_long=37.6173")
        # Может вернуть 200 (если товар существует) или 404
        assert response.status_code in [200, 404]

    def test_get_product_offers_missing_coordinates(self, client):
        """Тест получения предложений без координат"""
        response = client.get("/products/1234567890123/offers")
        assert response.status_code == 422

    def test_search_products_success(self, client):
        """Тест поиска товаров"""
        response = client.get("/products/search?q=test")
        assert response.status_code == 200

    def test_search_products_empty_query(self, client):
        """Тест поиска с пустым запросом"""
        response = client.get("/products/search?q=")
        assert response.status_code == 422

    def test_search_products_with_pagination(self, client):
        """Тест поиска с пагинацией"""
        response = client.get("/products/search?q=test&offset=5&limit=10")
        assert response.status_code == 200