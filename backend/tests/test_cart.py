import pytest


class TestCart:
    def test_get_cart_unauthorized(self, client):
        """Тест получения корзины без авторизации"""
        response = client.post("/cart",)
        assert response.status_code == 401


    def test_create_cart_success(self, client, auth_headers):
        """Тест успешного создания корзины"""
        response = client.post("/cart", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert "order_id" in data["data"]
        assert "user_id" in data["data"]
        assert "created_at" in data["data"]

    def test_get_cart_success(self, client, auth_headers, cart_order):
        """Тест успешного получения корзины"""
        response = client.get("/cart", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert "user_id" in data
        assert "created_at" in data
        assert "items" in data
        assert "total_amount" in data
        assert "total_items" in data

    def test_cart_workflow(self, client, auth_headers):
        """Полный workflow работы с корзиной"""
        # Создаем корзину
        order_response = client.post("/cart", headers=auth_headers)
        assert order_response.status_code == 200
        order_data = order_response.json()
        order_id = order_data["data"]["order_id"]

        # Добавляем товары в корзину
        items = [
            {"sku_id": 1, "quantity": 2},
            {"sku_id": 2, "quantity": 1}
        ]

        for item in items:
            response = client.post(
                f"/orders/{order_id}/items",
                json=item,
                headers=auth_headers
            )
            # Может вернуть 201 или 404 если SKU не существует
            assert response.status_code in [201, 404]

        # Получаем корзину и проверяем
        cart_response = client.get("/cart", headers=auth_headers)
        assert cart_response.status_code == 200
        cart_data = cart_response.json()

        # Если товары добавились успешно
        if cart_data["total_items"] > 0:
            # Обновляем количество первого товара
            first_item_id = cart_data["items"][0]["id"]
            update_response = client.put(
                f"/order-items/{first_item_id}",
                json={"quantity": 5},
                headers=auth_headers
            )
            assert update_response.status_code == 200

            # Удаляем второй товар
            if len(cart_data["items"]) > 1:
                second_item_id = cart_data["items"][1]["id"]
                delete_response = client.delete(
                    f"/order-items/{second_item_id}",
                    headers=auth_headers
                )
                assert delete_response.status_code == 200

    def test_create_order_from_cart(self, client, auth_headers):
        order_response = client.post("/cart", headers=auth_headers) # создаём корзину
        assert order_response.status_code == 200

        order_info = {
            "address": "Гражданский",
            "delivery_method": "courier",
        }
        # оформляем заказ
        response = client.post(
            "/order",
            headers=auth_headers,
            json=order_info
        )

        assert response.status_code == 200
        data = response.json()
        assert "id" in data
        assert data["address"] == order_info["address"]
        assert data["delivery_method"] == order_info["delivery_method"]

        # проверяем, что у пользователя нет корзины
        response = client.get(
            "/cart",
            headers=auth_headers,
        )
        assert response.status_code == 404
