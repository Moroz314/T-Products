from fastapi.responses import JSONResponse
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from .model import *
from ..database.repository import ProductFeedRepository

class ProductFeedService:
    def __init__(self, db: Session):
        self.feed_repo = ProductFeedRepository(db)

    def get_products_feed(self, request: ProductFeedRequest):
        try:
            products_data, total_count = self.feed_repo.get_products_feed(
                offset=request.offset,
                limit=request.limit,
                search=request.search,
                category=request.category,
                merchant_ids=request.merchant_ids,
                sort_by=request.sort_by,
                user_lat=request.user_lat,
                user_long=request.user_long
            )

            # Дополнительная сортировка на уровне сервиса для best_value
            if request.sort_by == "best_value" and request.user_lat and request.user_long:
                products_data = self._sort_products_by_best_value(products_data)

            response_data = {
                "products": products_data,
                "total_count": total_count,
                "offset": request.offset,
                "limit": request.limit
            }

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "status": "success",
                    "message": "Лента товаров успешно получена",
                    "data": response_data
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при получении ленты товаров: {str(e)}"
            )

    @staticmethod
    def _sort_products_by_best_value(products_data: List[Dict]) -> List[Dict]:
        """Сортировать товары по лучшему предложению (best value)"""

        def get_product_score(product: Dict) -> float:
            """Рассчитать скор для товара на основе лучшего предложения"""
            if not product.get('best_offer'):
                return float('inf')

            best_offer = product['best_offer']
            return best_offer['price']

        return sorted(products_data, key=get_product_score)

    def get_categories(self):
        """Получить список категорий"""
        try:
            categories = self.feed_repo.get_categories()

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "status": "success",
                    "message": "Список категорий успешно получен",
                    "data": {
                        "categories": categories
                    }
                }
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при получении категорий: {str(e)}"
            )

    def get_merchants(self):
        """Получить список мерчантов"""
        try:
            merchants = self.feed_repo.get_merchants()

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "status": "success",
                    "message": "Список магазинов успешно получен",
                    "data": {
                        "merchants": merchants
                    }
                }
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при получении списка магазинов: {str(e)}"
            )

    def find_best_offers_for_product(self, ean: int, user_lat: float, user_long: float):
        try:
            product = self.feed_repo.get_product_with_offers(ean)

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Товар с EAN {ean} не найден"
                )

            offers = []
            for stock in product.stocks:
                if stock.amount > 0:
                    distance = self.feed_repo.calculate_distance(
                        user_lat, user_long,
                        stock.stock.lat, stock.stock.long
                    )

                    offer = {
                        "sku_id": stock.sku_id,
                        "price": stock.price,
                        "amount": stock.amount,
                        "merchant_id": stock.stock.merchant.id,
                        "merchant_name": stock.stock.merchant.name,
                        "stock_id": stock.stock_id,
                        "stock_address": stock.address,
                        "distance_km": round(distance, 2),
                        "stock_lat": stock.stock.lat,
                        "stock_long": stock.stock.long
                    }
                    offers.append(offer)

            # Сортируем предложения по best_value
            sorted_offers = self.feed_repo._sort_product_offers(
                offers, "best_value", user_lat, user_long
            )

            best_offer = sorted_offers[0] if sorted_offers else None

            response_data = {
                "product": {
                    "ean": product.ean,
                    "name": product.name,
                    "category": product.category
                },
                "offers": sorted_offers,
                "best_offer": best_offer
            }

            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "status": "success",
                    "message": "Предложения для товара успешно получены",
                    "data": response_data
                }
            )

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при поиске предложений для товара: {str(e)}"
            )

    def search_products(self, query: str, offset: int = 0, limit: int = 20):
        """Поиск товаров по названию или категории"""
        try:
            request = ProductFeedRequest(
                offset=offset,
                limit=limit,
                search=query,
                sort_by="price"
            )

            return self.get_products_feed(request)

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Ошибка при поиске товаров: {str(e)}"
            )