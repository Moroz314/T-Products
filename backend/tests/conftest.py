import pytest
from fastapi.testclient import TestClient
from ..src.app import app  # Импортируйте ваше FastAPI приложение


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def user_data():
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpassword123"
    }


@pytest.fixture
def merchant_data():
    return {
        "name": "Test Merchant",
        "email": "merchant@example.com",
        "password": "merchantpass123"
    }


@pytest.fixture
def auth_user(client, user_data):
    # Регистрация пользователя
    client.post("/user/register", json=user_data)

    # Аутентификация
    response = client.post("/user/sign_in", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    return response.json()


@pytest.fixture
def auth_merchant(client, merchant_data):
    # Регистрация мерчанта
    client.post("/merchant/register", json=merchant_data)

    # Аутентификация
    response = client.post("/merchant/sign_in", json={
        "email": merchant_data["email"],
        "password": merchant_data["password"]
    })
    return response.json()


@pytest.fixture
def auth_headers(auth_user):
    return {"Authorization": f"Bearer {auth_user['access_token']}"}


@pytest.fixture
def merchant_headers(auth_merchant):
    return {"Authorization": f"Bearer {auth_merchant['access_token']}"}


@pytest.fixture
def cart_order(client, auth_headers):
    """Фикстура для создания корзины/заказа"""
    response = client.post("/cart", headers=auth_headers)
    return response.json()