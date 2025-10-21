from .models import *
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, text, delete
from sqlalchemy import and_, update
import math
from typing import List, Optional, Tuple, Dict


class Repository:
    def __init__(self, session: Session):
        self.session = session


class UserRepository(Repository):
    def get_user_by_email(self, email: str):
        user = self.session.query(User).filter(User.email == email).first()
        return user

    def create(self, user_data: dict):
        user = User(**user_data)
        self.session.add(user)
        self.session.commit()

        return user


class MerchantRepository(Repository):
    def get_merchant_by_email(self, email: str):
        merchant = self.session.query(Merchants).filter(Merchants.email == email).first()
        return merchant

    def create(self, merchant_data: dict):
        merchant = Merchants(**merchant_data)
        self.session.add(merchant)
        self.session.commit()

        return merchant


class ProductRepository(Repository):
    def check_stock_by_merchant_id(self, merchant_id, stock_id):
        stock = (self.session
                 .query(Stocks)
                 .filter(
            and_
                (
                Stocks.merchant_id == merchant_id,
                Stocks.id == stock_id
            )
        ).first())

        return stock

    def add_to_list(self, product_data: dict) -> Products:
        product = Products(**product_data)
        self.session.add(product)
        self.session.commit()

        return product

    def add_to_stock(self, stock_id: int, product_data: dict) -> ProductsStock:
        product_stock = ProductsStock(stock_id=stock_id, **product_data)
        self.session.add(product_stock)
        self.session.commit()

        return product_stock

    def update_product(self, sku_id: int, data: dict):
        stmt = update(ProductsStock).values(**data).filter(ProductsStock.sku_id == sku_id)

        self.session.execute(stmt)
        self.session.commit()

    def get_product_by_sku_id(self, sku_id: int):
        product = (
            self.session.query(ProductsStock)
            .options(joinedload(ProductsStock.product))
            .filter_by(sku_id=sku_id)
            .first()
        )
        return product

    def get_products_by_skus(self, sku_ids: List[int]) -> List[ProductsStock]:
        """Получить информацию о товарах по списку SKU"""
        products = (
            self.session.query(ProductsStock)
            .options(
                joinedload(ProductsStock.product),
                joinedload(ProductsStock.stock)
                .joinedload(Stocks.merchant)
            )
            .filter(ProductsStock.sku_id.in_(sku_ids))
            .all()
        )
        return products


class ProductFeedRepository(Repository):

    def calculate_distance(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Рассчитать расстояние между двумя точками в км (формула Haversine)"""
        R = 6371  # Радиус Земли в км

        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)

        a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2) * math.sin(dlon / 2))

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance = R * c

        return distance

    def get_products_feed(
            self,
            offset: int = 0,
            limit: int = 20,
            search: Optional[str] = None,
            category: Optional[str] = None,
            merchant_ids: Optional[List[int]] = None,
            sort_by: str = "price",
            user_lat: Optional[float] = None,
            user_long: Optional[float] = None
    ) -> Tuple[List[Dict], int]:

        subquery = (
            self.session.query(Products.ean)
            .join(ProductsStock, Products.ean == ProductsStock.product_ean)
            .join(Stocks, ProductsStock.stock_id == Stocks.id)
        )

        # Применяем фильтры
        if search:
            search_filter = or_(
                Products.name.ilike(f"%{search}%"),
                Products.category.ilike(f"%{search}%")
            )
            subquery = subquery.filter(search_filter)

        if category:
            subquery = subquery.filter(Products.category.ilike(f"%{category}%"))

        if merchant_ids:
            subquery = subquery.filter(Stocks.merchant_id.in_(merchant_ids))

        # Получаем уникальные EAN с пагинацией
        unique_eans = subquery.distinct().offset(offset).limit(limit).all()
        unique_eans = [ean[0] for ean in unique_eans]

        # Получаем общее количество
        total_count = subquery.distinct().count()

        if not unique_eans:
            return [], total_count

        # Теперь получаем полные данные для этих EAN
        query = (
            self.session.query(Products)
            .options(
                joinedload(Products.stocks)
                .joinedload(ProductsStock.stock)
                .joinedload(Stocks.merchant)
            )
            .filter(Products.ean.in_(unique_eans))
        )

        # Сортируем результат
        if sort_by == "price":
            # Для сортировки по цене нам нужно присоединить ProductsStock
            query = (
                query.join(ProductsStock, Products.ean == ProductsStock.product_ean)
                .order_by(ProductsStock.price.asc(), Products.ean)
            )
        elif sort_by == "name":
            query = query.order_by(Products.name.asc())
        else:
            query = query.order_by(Products.name.asc())

        products = query.all()

        # Обрабатываем результаты
        processed_products = []
        for product in products:
            product_data = self._process_product(
                product, user_lat, user_long, sort_by
            )
            if product_data:
                processed_products.append(product_data)

        return processed_products, total_count


    def _process_product(
            self,
            product: Products,
            user_lat: Optional[float],
            user_long: Optional[float],
            sort_by: str
    ) -> Optional[Dict]:
        """Обработать продукт и его предложения"""

        offers = []
        for stock in product.stocks:
            if stock.amount > 0:  # Только товары в наличии
                offer = {
                    'sku_id': stock.sku_id,
                    'price': stock.price,
                    'amount': stock.amount,
                    'merchant_id': stock.stock.merchant.id,
                    'merchant_name': stock.stock.merchant.name,
                    'stock_id': stock.stock_id,
                    'stock_lat': stock.stock.lat,
                    'stock_long': stock.stock.long,
                    'distance_km': None
                }

                # Рассчитываем расстояние если есть координаты пользователя
                if user_lat and user_long:
                    distance = self.calculate_distance(
                        user_lat, user_long,
                        stock.stock.lat, stock.stock.long
                    )
                    offer['distance_km'] = round(distance, 2)

                offers.append(offer)

        if not offers:
            return None

        # Сортируем предложения внутри товара
        sorted_offers = self._sort_product_offers(offers, sort_by, user_lat, user_long)

        # Лучшее предложение - первое в отсортированном списке
        best_offer = sorted_offers[0] if sorted_offers else None

        return {
            'ean': product.ean,
            'name': product.name,
            'category': product.category,
            'weight': product.weight,
            'offers': sorted_offers,
            'best_offer': best_offer,
            'min_price': min(offer['price'] for offer in offers),
            'max_price': max(offer['price'] for offer in offers)
        }

    def _sort_product_offers(
            self,
            offers: List[Dict],
            sort_by: str,
            user_lat: Optional[float],
            user_long: Optional[float]
    ) -> List[Dict]:

        if not offers:
            return []

        if sort_by == "price":
            # Сортируем по цене (дешевые сначала)
            return sorted(offers, key=lambda x: x['price'])

        elif sort_by == "distance" and user_lat and user_long:
            # Сортируем по расстоянию (близкие сначала)
            offers_with_distance = [o for o in offers if o['distance_km'] is not None]
            if offers_with_distance:
                return sorted(offers_with_distance, key=lambda x: x['distance_km'])
            else:
                return sorted(offers, key=lambda x: x['price'])

        elif sort_by == "best_value":
            # Лучшее соотношение цены и расстояния для одного товара
            if user_lat and user_long:
                offers_with_distance = [o for o in offers if o['distance_km'] is not None]
                if offers_with_distance:
                    # Взвешенная оценка - 70% цена 30% расстояние
                    def value_score(offer):
                        # Нормализация
                        prices = [o['price'] for o in offers_with_distance]
                        distances = [o['distance_km'] for o in offers_with_distance]

                        max_price = max(prices)
                        max_distance = max(distances)

                        # Избегаем деления на ноль
                        if max_price == 0:
                            price_norm = 0
                        else:
                            price_norm = offer['price'] / max_price

                        if max_distance == 0:
                            distance_norm = 0
                        else:
                            distance_norm = offer['distance_km'] / max_distance

                        return 0.7 * price_norm + 0.3 * distance_norm

                    return sorted(offers_with_distance, key=value_score)


        return sorted(offers, key=lambda x: x['price'])

    def get_categories(self) -> List[str]:
        categories = (
            self.session.query(Products.category)
            .distinct()
            .order_by(Products.category)
            .all()
        )
        return [cat[0] for cat in categories if cat[0]]

    def get_merchants(self) -> List[Dict]:
        merchants = (
            self.session.query(Merchants)
            .all()
        )
        return [
            {
                'id': merchant.id,
                'name': merchant.name
            }
            for merchant in merchants
        ]

    def get_product_with_offers(self, ean: int) -> Optional[Products]:
        product = (
            self.session.query(Products)
            .options(
                joinedload(Products.stocks)
                .joinedload(ProductsStock.stock)
                .joinedload(Stocks.merchant)
            )
            .filter(Products.ean == ean)
            .first()
        )
        return product


class ItemRepository(Repository):
    def add_item(self, order_id: int, sku_id: int, quantity: int) -> OrderItem:
        try:
            item = OrderItem(
                order_id=order_id,
                sku_id=sku_id,
                quantity=quantity
            )
            self.session.add(item)
            self.session.commit()
            return item

        except Exception as e:
            self.session.rollback()
            raise e

    def delete_item(self, item_id: int) -> bool:
        try:
            stmt = delete(OrderItem).where(OrderItem.id == item_id)
            result = self.session.execute(stmt)
            self.session.commit()
            return result.rowcount > 0

        except Exception as e:
            self.session.rollback()
            raise e

    def get_item_by_id(self, item_id: int) -> Optional[OrderItem]:
        item = (
            self.session.query(OrderItem)
            .options(
                joinedload(OrderItem.product_stock)
                .joinedload(ProductsStock.product)
            )
            .filter(OrderItem.id == item_id)
            .first()
        )
        return item

    def get_order_items(self, order_id: int) -> List[OrderItem]:
        items = (
            self.session.query(OrderItem)
            .options(
                joinedload(OrderItem.product_stock)
                .joinedload(ProductsStock.product),
                joinedload(OrderItem.product_stock)
                .joinedload(ProductsStock.stock)
                .joinedload(Stocks.merchant)
            )
            .filter(OrderItem.order_id == order_id)
            .all()
        )
        return items

    def update_item_quantity(self, item_id: int, quantity: int) -> Optional[OrderItem]:
        try:
            item = self.session.query(OrderItem).filter(OrderItem.id == item_id).first()
            if item:
                item.quantity = quantity
                self.session.commit()
            return item
        except Exception as e:
            self.session.rollback()
            raise e

    def clear_order_items(self, order_id: int) -> bool:
        try:
            stmt = delete(OrderItem).where(OrderItem.order_id == order_id)
            result = self.session.execute(stmt)
            self.session.commit()

            return result.rowcount > 0

        except Exception as e:
            self.session.rollback()
            raise e

    def get_items_by_sku(self, order_id: int, sku_id: int) -> List[OrderItem]:
        items = (
            self.session.query(OrderItem)
            .filter(OrderItem.order_id == order_id, OrderItem.sku_id == sku_id)
            .all()
        )
        return items


class OrderRepository(Repository):
    def create_cart(self, user_id: int) -> Orders:
        try:
            order = Orders(
                user_id=user_id
            )
            self.session.add(order)
            self.session.commit()

            return order
        except Exception as e:
            self.session.rollback()
            raise e


    def get_cart(self, user_id: int):
        cart = self.session.query(Orders).filter(
            and_(
                    Orders.user_id == user_id,
                    Orders.status == "unconfirmed"
                 )
        ).first()

        return cart

    def create_order(self, order_id: int, delivery_method: str, address: str):
        try:
            order = self.session.query(Orders).filter(Orders.id == order_id).first()
            if order:
                order.status = "confirmed"
                order.delivery_method = delivery_method
                order.address = address
                self.session.commit()
            return order

        except Exception as e:
            self.session.rollback()
            raise e


    def get_order_by_id(self, order_id: int) -> Optional[Orders]:
        order = (
            self.session.query(Orders)
            .options(
                joinedload(Orders.items)
                .joinedload(OrderItem.product_stock)
                .joinedload(ProductsStock.product),
                joinedload(Orders.items)
                .joinedload(OrderItem.product_stock)
                .joinedload(ProductsStock.stock)
                .joinedload(Stocks.merchant)
            )
            .filter(Orders.id == order_id)
            .first()
        )
        return order

    def get_user_orders(self, user_id: int, limit: int = 50, offset: int = 0) -> Tuple[List[Orders], int]:
        query = (
            self.session.query(Orders)
            .options(
                joinedload(Orders.items)
                .joinedload(OrderItem.product_stock)
                .joinedload(ProductsStock.product)
            )
            .filter(Orders.user_id == user_id)
            .order_by(Orders.created_at.desc())
        )

        total_count = query.count()
        orders = query.offset(offset).limit(limit).all()

        return orders, total_count

    def delete_order(self, order_id: int) -> bool:
        try:
            order = self.session.query(Orders).filter(Orders.id == order_id).first()
            if order:
                self.session.delete(order)
                self.session.commit()
                return True
            return False
        except Exception as e:
            self.session.rollback()
            raise e








