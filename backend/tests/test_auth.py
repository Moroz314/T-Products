import pytest


class TestAuth:
    def test_user_registration_success(self, client, user_data):
        """Тест успешной регистрации пользователя"""
        response = client.post("/user/register", json=user_data)
        assert response.status_code == 201
        data = response.json()

        assert "access_token" in data
        assert "user_id" in data
        assert isinstance(data["user_id"], int)

    def test_user_registration_duplicate_email(self, client, user_data):
        """Тест регистрации с существующим email"""
        # Первая регистрация
        client.post("/user/register", json=user_data)

        # Вторая регистрация с тем же email
        duplicate_data = user_data.copy()
        duplicate_data["username"] = "different_user"
        response = client.post("/user/register", json=duplicate_data)

        # Ожидаем ошибку
        assert response.status_code in [400, 422, 409]

    def test_user_sign_in_success(self, client, user_data):
        """Тест успешного входа пользователя"""
        # Сначала регистрируем
        client.post("/user/register", json=user_data)

        # Затем входим
        response = client.post("/user/sign_in", json={
            "email": user_data["email"],
            "password": user_data["password"]
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "user_id" in data

    def test_user_sign_in_wrong_password(self, client, user_data):
        """Тест входа с неправильным паролем"""
        client.post("/user/register", json=user_data)

        response = client.post("/user/sign_in", json={
            "email": user_data["email"],
            "password": "wrongpassword"
        })

        assert response.status_code in [400, 401]

    def test_user_sign_in_nonexistent_user(self, client):
        """Тест входа несуществующего пользователя"""
        response = client.post("/user/sign_in", json={
            "email": "nonexistent@example.com",
            "password": "anypassword"
        })

        assert response.status_code in [400, 401, 404]

    def test_merchant_registration_success(self, client, merchant_data):
        """Тест успешной регистрации мерчанта"""
        response = client.post("/merchant/register", json=merchant_data)
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert "merchant_id" in data

    def test_merchant_sign_in_success(self, client, merchant_data):
        """Тест успешного входа мерчанта"""
        # Сначала регистрируем
        client.post("/merchant/register", json=merchant_data)

        # Затем входим
        response = client.post("/merchant/sign_in", json={
            "email": merchant_data["email"],
            "password": merchant_data["password"]
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "merchant_id" in data