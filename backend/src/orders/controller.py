from fastapi import APIRouter, Depends
from .service import *
from .model import *
from ..dependencies import get_order_service, get_item_service
from typing import Dict, Any


orders_router = APIRouter()


@orders_router.post(
    "/orders/{order_id}/items",
    response_model=OrderItemCreateResponse,
    status_code=201,
    summary="Добавить товар в заказ",
    description="Добавляет товар в указанный заказ"
)
def add_item_to_order(
    order_id: int,
    request: OrderItemCreateRequest,
    item_service: OrderItemService = Depends(get_item_service)
) -> OrderItemCreateResponse:
    return item_service.add_item_to_order(order_id, request)

@orders_router.put(
    "/order-items/{item_id}",
    response_model=OrderItemUpdateResponse,
    summary="Обновить количество товара",
    description="Обновляет количество товара в позиции заказа"
)
def update_order_item(
    item_id: int,
    request: OrderItemUpdateRequest,
    item_service: OrderItemService = Depends(get_item_service)
) -> OrderItemUpdateResponse:
    return item_service.update_item_quantity(item_id, request)

@orders_router.delete(
    "/order-items/{item_id}",
    response_model=OrderItemDeleteResponse,
    summary="Удалить товар из заказа",
    description="Удаляет товар из заказа по ID позиции"
)
def remove_order_item(
    item_id: int,
    item_service: OrderItemService = Depends(get_item_service)
) -> OrderItemDeleteResponse:
    return item_service.remove_item_from_order(item_id)

@orders_router.get(
    "/orders/{order_id}/items",
    response_model=OrderItemsListResponse,
    summary="Получить товары заказа",
    description="Возвращает список всех товаров в указанном заказе"
)
def get_order_items(
    order_id: int,
    item_service: OrderItemService = Depends(get_item_service)
) -> OrderItemsListResponse:
    return item_service.get_order_items(order_id)

@orders_router.get(
    "/orders/{order_id}",
    response_model=OrderDetailResponse,
    summary="Получить информацию о заказе",
    description="Возвращает детальную информацию о конкретном заказе"
)
def get_order(
    order_id: int,
    order_service: OrderService = Depends(get_order_service)
) -> OrderDetailResponse:
    return order_service.get_order(order_id)

@orders_router.get(
    "/cart",
    response_model=CartResponse,
    summary="Получить корзину",
    description="Возвращает текущую корзину пользователя"
)
def get_cart(
    order_service: OrderService = Depends(get_order_service)
) -> CartResponse:
    return order_service.get_cart()

@orders_router.post(
    "/cart",
    response_model=OrderCreateResponse,
    summary="Создание корзины",
    description="Создаёт пустую корзину пользователю"
)
def cart_create(
    order_service: OrderService = Depends(get_order_service)
) -> OrderCreateResponse:
    return order_service.create_cart()

@orders_router.post(
    "/order",
    response_model=OrderResponse,
    summary="Оформление заказа",
    description="Переводит корзину в состояние заказа"
)
def create_order_from_cart(
    request: OrderCreateInfo,
    order_service: OrderService = Depends(get_order_service)
) -> OrderResponse:
    return order_service.create_order(request)

@orders_router.get(
    "/users/orders",
    response_model=OrdersListResponse,
    summary="Получить историю заказов",
    description="Возвращает историю заказов пользователя с пагинацией"
)
def get_user_orders(
    limit: int = 50,
    offset: int = 0,
    order_service: OrderService = Depends(get_order_service)
) -> OrdersListResponse:
    return order_service.get_user_orders(limit, offset)

@orders_router.delete(
    "/orders/{order_id}",
    response_model=OrderDeleteResponse,
    summary="Удалить заказ",
    description="Полностью удаляет заказ и все его товары"
)
def delete_order(
    order_id: int,
    order_service: OrderService = Depends(get_order_service)
) -> OrderDeleteResponse:
    return order_service.delete_order(order_id)