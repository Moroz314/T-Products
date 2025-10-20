from starlette.responses import JSONResponse
from ..database.repository import *
from fastapi import HTTPException, status
from .model import *
from typing import Dict, Any


class OrderItemService:
    def __init__(self, db: Session, user_id: int):
        self.item_repo = ItemRepository(db)
        self.order_repo = OrderRepository(db)
        self.product_repo = ProductRepository(db)
        self.user_id = user_id

    def check_order(self, order_id: int):
        order = self.order_repo.get_order_by_id(order_id)

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Заказ с ID {order_id} не найден"
            )

        if order.user_id != self.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='you can not edit this order'
            )

    def add_item_to_order(self, order_id: int, request: OrderItemCreateRequest) -> OrderItemCreateResponse:
        self.check_order(order_id)
        try:
            # Проверяем существование заказа
            order = self.order_repo.get_order_by_id(order_id)
            if not order:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Заказ с ID {order_id} не найден"
                )

            # Проверяем наличие товара
            product_stock = self.product_repo.get_product_by_sku_id(request.sku_id)
            if not product_stock:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Товар с SKU {request.sku_id} не найден"
                )

            # Проверяем количество на складе
            if product_stock.amount < request.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Недостаточно товара в наличии. Доступно: {product_stock.amount}"
                )

            # Добавляем товар в заказ
            item = self.item_repo.add_item(order_id, request.sku_id, request.quantity)

            return OrderItemCreateResponse(
                message="Товар успешно добавлен в заказ",
                data=OrderItemData(
                    item_id=item.id,
                    order_id=item.order_id,
                    sku_id=item.sku_id,
                    quantity=item.quantity
                )
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при добавлении товара в заказ: {str(e)}"
            )

    def update_item_quantity(self, item_id: int, request: OrderItemUpdateRequest) -> OrderItemUpdateResponse:
        try:
            # Проверяем существование элемента
            item = self.item_repo.get_item_by_id(item_id)
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Элемент заказа с ID {item_id} не найден"
                )

            self.check_order(item.order_id)

            # Проверяем наличие товара на складе
            product_stock = self.product_repo.get_product_by_sku_id(item.sku_id)
            if product_stock.amount < request.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Недостаточно товара в наличии. Доступно: {product_stock.amount}"
                )

            # Обновляем количество
            updated_item = self.item_repo.update_item_quantity(item_id, request.quantity)

            return OrderItemUpdateResponse(
                message="Количество товара обновлено",
                data=OrderItemUpdateData(
                    item_id=updated_item.id,
                    quantity=updated_item.quantity
                )
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при обновлении товара в заказе: {str(e)}"
            )

    def remove_item_from_order(self, item_id: int) -> OrderItemDeleteResponse:
        try:
            item = self.item_repo.get_item_by_id(item_id)
            if not item:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Элемент заказа с ID {item_id} не найден"
                )

            self.check_order(item.order_id) # проверяем что товар

            success = self.item_repo.delete_item(item_id)

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Не удалось удалить товар из заказа"
                )

            return OrderItemDeleteResponse(
                message="Товар успешно удален из заказа"
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при удалении товара из заказа: {str(e)}"
            )

    def get_order_items(self, order_id: int) -> OrderItemsListResponse:
        self.check_order(order_id)
        try:
            items = self.item_repo.get_order_items(order_id)

            items_data = []
            total_amount = 0.0


            for item in items:
                product_stock = item.product_stock
                item_total = product_stock.price * item.quantity
                total_amount += item_total

                items_data.append(OrderItemResponse(
                    id=item.id,
                    order_id=item.order_id,
                    sku_id=item.sku_id,
                    quantity=item.quantity,
                    product_name=product_stock.product.name,
                    price=product_stock.price,
                    merchant_name=product_stock.stock.merchant.name,
                    total_price=item_total
                ))

            return OrderItemsListResponse(
                message="Товары заказа успешно получены",
                data=OrderItemsData(
                    order_id=order_id,
                    items=items_data,
                    total_amount=total_amount,
                    total_items=len(items_data)
                )
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при получении товаров заказа: {str(e)}"
            )


class OrderService:
    def __init__(self, db: Session, user_id: int):
        self.order_repo = OrderRepository(db)
        self.item_repo = ItemRepository(db)
        self.product_repo = ProductRepository(db)
        self.user_id = user_id

    @staticmethod
    def check_order_found(order):
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order not found"
            )

    @staticmethod
    def check_order_privileges(order, user_id):
        if order.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="fail to change order status"
            )

    def create_cart(self) -> OrderCreateResponse:
        try:
            # Создаем заказ
            order = self.order_repo.create_cart(self.user_id)

            return OrderCreateResponse(
                message="Корзина успешно создана",
                data=OrderCreateData(
                    order_id=order.id,
                    user_id=self.user_id,
                    created_at=order.created_at,
                    status="unconfirmed"
                )
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при создании заказа: {str(e)}"
            )

    def create_order(self, request: OrderCreateInfo) -> OrderResponse:
        cart = self.order_repo.get_cart(self.user_id)

        # проверки на принадлежность и существование корзины
        self.check_order_found(cart)
        self.check_order_privileges(cart, self.user_id)

        order = self.order_repo.create_order(
            cart.id,
            delivery_method=request.delivery_method,
            address=request.address
        )

        return self._format_order_response(order)

    def get_order(self, order_id: int) -> OrderDetailResponse:
        try:
            order = self.order_repo.get_order_by_id(order_id)

            self.check_order_found(order)
            self.check_order_privileges(order, self.user_id)

            order_data = self._format_order_response(order)

            return OrderDetailResponse(
                message="Информация о заказе успешно получена",
                data={"order": order_data}
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при получении информации о заказе: {str(e)}"
            )

    def get_cart(self) -> CartResponse:
        try:
            orders, total_count = self.order_repo.get_user_orders(self.user_id)
            if not orders:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Корзина не найдена"
                )

            cart_data = self._format_cart_response(orders[0])

            return cart_data

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при получении корзины: {str(e)}"
            )

    def get_user_orders(self, limit: int = 50, offset: int = 0) -> OrdersListResponse:
        """Получить историю заказов пользователя"""
        try:
            orders, total_count = self.order_repo.get_user_orders(self.user_id, limit, offset)

            orders_data = []
            for order in orders:
                orders_data.append(self._format_order_response(order))

            return OrdersListResponse(
                message="История заказов успешно получена",
                data=OrderListData(
                    orders=orders_data,
                    total_count=total_count,
                    limit=limit,
                    offset=offset
                )
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при получении истории заказов: {str(e)}"
            )

    def delete_order(self, order_id: int) -> OrderDeleteResponse:
        order = self.order_repo.get_order_by_id(order_id)

        self.check_order_found(order)
        self.check_order_privileges(order, self.user_id)

        try:
            self.item_repo.clear_order_items(order_id)
            success = self.order_repo.delete_order(order_id)

            if not success:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Delete error"
                )

            return OrderDeleteResponse(
                message="Заказ успешно удален"
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при удалении заказа: {str(e)}"
            )

    def _format_order_response(self, order: Orders) -> OrderResponse:
        """Форматировать ответ с информацией о заказе"""
        items_data = []
        total_amount = 0.0

        for item in order.items:
            product_stock = item.product_stock
            item_total = product_stock.price * item.quantity
            total_amount += item_total

            items_data.append(OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                sku_id=item.sku_id,
                quantity=item.quantity,
                product_name=product_stock.product.name,
                price=product_stock.price,
                merchant_name=product_stock.stock.merchant.name,
                total_price=item_total
            ))

        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            created_at=order.created_at,
            delivery_method=order.delivery_method,
            address=order.address,
            items=items_data,
            total_amount=total_amount,
            total_items=len(items_data),
            status=order.status
        )

    def _format_cart_response(self, order: Orders) -> CartResponse:
        """Форматировать ответ с информацией о корзине"""
        items_data = []
        total_amount = 0.0

        for item in order.items:
            product_stock = item.product_stock
            item_total = product_stock.price * item.quantity
            total_amount += item_total

            items_data.append(OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                sku_id=item.sku_id,
                quantity=item.quantity,
                product_name=product_stock.product.name,
                price=product_stock.price,
                merchant_name=product_stock.stock.merchant.name,
                total_price=item_total
            ))

        return CartResponse(
            id=order.id,
            user_id=order.user_id,
            created_at=order.created_at,
            items=items_data,
            total_amount=total_amount,
            total_items=len(items_data)
        )