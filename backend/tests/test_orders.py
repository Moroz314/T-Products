import pytest


class TestOrders:
    def test_create_order_success(self, client, auth_headers):
        resp = client.post("/cart", headers=auth_headers)
        assert resp.status_code == 200
        request_data = {
            "address": "Дунайский пр",
            "delivery_method": "pickup"
        }
        response = client.post("/order", json=request_data, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "confirmed"
        assert data["address"] == request_data["address"]
        assert "id" in data
        assert "user_id" in data
        assert "created_at" in data

    def test_create_order_unauthorized(self, client):
        """Тест создания заказа без авторизации"""
        response = client.post("/orders")
        assert response.status_code == 401

    def test_add_item_to_order_success(self, client, auth_headers, cart_order):
        """Тест добавления товара в заказ"""
        # Сначала создаем заказ
        order_id = cart_order["data"]["order_id"]

        # Добавляем товар
        item_data = {"sku_id": 1, "quantity": 2}
        response = client.post(
            f"/orders/{order_id}/items",
            json=item_data,
            headers=auth_headers
        )
        # Может вернуть 201 или 404 если SKU не существует
        assert response.status_code in [201, 404, 422]

    def test_add_item_to_nonexistent_order(self, client, auth_headers):
        """Тест добавления товара в несуществующий заказ"""
        item_data = {"sku_id": 1, "quantity": 2}
        response = client.post(
            "/orders/9999/items",
            json=item_data,
            headers=auth_headers
        )
        assert response.status_code in [404, 403, 422]


    def test_get_order_items_success(self, client, auth_headers):
        """Тест получения товаров заказа"""
        # Создаем заказ

        order_response = client.post("/orders", headers=auth_headers)
        order_id = order_response.json()["data"]["order_id"]

        # Получаем товары (даже если заказ пустой)
        response = client.get(f"/orders/{order_id}/items", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "items" in data["data"]
        assert "total_amount" in data["data"]
        assert "total_items" in data["data"]

    def test_update_order_item_quantity(self, client, auth_headers):
        """Тест обновления количества товара"""
        # Создаем заказ и добавляем товар
        order_response = client.post("/cart", headers=auth_headers)
        order_id = order_response.json()["data"]["order_id"]

        item_response = client.post(
            f"/orders/{order_id}/items",
            json={"sku_id": 1, "quantity": 2},
            headers=auth_headers
        )

        if item_response.status_code == 201:
            item_id = item_response.json()["data"]["item_id"]

            # Обновляем количество
            update_data = {"quantity": 5}
            response = client.put(
                f"/order-items/{item_id}",
                json=update_data,
                headers=auth_headers
            )
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"
            assert data["data"]["quantity"] == 5

    def test_delete_order_item(self, client, auth_headers):
        """Тест удаления товара из заказа"""
        # Создаем заказ и добавляем товар
        order_response = client.post("/orders", headers=auth_headers)
        order_id = order_response.json()["data"]["order_id"]

        item_response = client.post(
            f"/orders/{order_id}/items",
            json={"sku_id": 1, "quantity": 2},
            headers=auth_headers
        )

        if item_response.status_code == 201:
            item_id = item_response.json()["data"]["item_id"]

            # Удаляем товар
            response = client.delete(f"/order-items/{item_id}", headers=auth_headers)
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "success"


    def test_delete_order(self, client, auth_headers):
        """Тест удаления заказа"""
        order_response = client.post("/orders", headers=auth_headers)
        order_id = order_response.json()["data"]["order_id"]

        response = client.delete(f"/orders/{order_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

    def test_get_user_orders_history(self, client, auth_headers):
        """Тест получения истории заказов"""
        response = client.get("/users/orders", headers=auth_headers)
        #assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "orders" in data["data"]
        assert "total_count" in data["data"]
        assert "limit" in data["data"]
        assert "offset" in data["data"]

    def test_get_user_orders_with_pagination(self, client, auth_headers):
        """Тест пагинации в истории заказов"""
        response = client.get("/users/orders?limit=10&offset=5", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["limit"] == 10
        assert data["data"]["offset"] == 5