from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from .service import ProductFeedService
from .model import (
    ProductFeedRequest, ProductFeedResponse, CategoriesListResponse,
    MerchantsListResponse, ProductOffersListResponse, SortOptions
)
from ..database.core import get_db

product_router = APIRouter()

@product_router.get(
    "/products/feed",
    response_model=ProductFeedResponse,
    summary="Получить ленту товаров",
    description="Возвращает отфильтрованную и отсортированную ленту товаров с предложениями"
)
def get_products_feed(
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
    limit: int = Query(20, ge=1, le=100, description="Лимит товаров на странице"),
    search: Optional[str] = Query(None, description="Поисковый запрос"),
    category: Optional[str] = Query(None, description="Фильтр по категории"),
    merchant_ids: Optional[str] = Query(None, description="Список ID магазинов через запятую"),
    sort_by: SortOptions = Query(SortOptions.PRICE, description="Поле для сортировки"),
    user_lat: Optional[float] = Query(None, description="Широта пользователя"),
    user_long: Optional[float] = Query(None, description="Долгота пользователя"),
    db: Session = Depends(get_db)
):
    merchant_ids_list = None
    if merchant_ids:
        try:
            merchant_ids_list = [int(x.strip()) for x in merchant_ids.split(",")]
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Некорректный формат merchant_ids"
            )

    request = ProductFeedRequest(
        offset=offset,
        limit=limit,
        search=search,
        category=category,
        merchant_ids=merchant_ids_list,
        sort_by=sort_by,
        user_lat=user_lat,
        user_long=user_long
    )

    feed_service = ProductFeedService(db)
    return feed_service.get_products_feed(request)

@product_router.get(
    "/products/categories",
    response_model=CategoriesListResponse,
    summary="Получить список категорий",
    description="Возвращает все доступные категории товаров"
)
def get_categories(db: Session = Depends(get_db)):
    feed_service = ProductFeedService(db)
    return feed_service.get_categories()

@product_router.get(
    "/products/merchants",
    response_model=MerchantsListResponse,
    summary="Получить список магазинов",
    description="Возвращает всех мерчантов/магазинов"
)
def get_merchants(db: Session = Depends(get_db)):
    feed_service = ProductFeedService(db)
    return feed_service.get_merchants()

@product_router.get(
    "/products/{ean}/offers",
    response_model=ProductOffersListResponse,
    summary="Получить предложения для товара",
    description="Возвращает все предложения для конкретного товара с ценами и расстояниями"
)
def get_product_offers(
    ean: int,
    user_lat: float = Query(..., description="Широта пользователя", example=55.7558),
    user_long: float = Query(..., description="Долгота пользователя", example=37.6173),
    db: Session = Depends(get_db)
):
    feed_service = ProductFeedService(db)
    return feed_service.find_best_offers_for_product(ean, user_lat, user_long)

@product_router.get(
    "/products/search",
    response_model=ProductFeedResponse,
    summary="Поиск товаров",
    description="Поиск товаров по названию или категории"
)
def search_products(
    q: str = Query(..., description="Поисковый запрос", min_length=1),
    offset: int = Query(0, ge=0, description="Смещение для пагинации"),
    limit: int = Query(20, ge=1, le=100, description="Лимит товаров на странице"),
    db: Session = Depends(get_db)
):
    feed_service = ProductFeedService(db)
    return feed_service.search_products(q, offset, limit)