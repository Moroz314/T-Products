from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class SortOptions(str, Enum):
    PRICE = "price"
    DISTANCE = "distance"
    BEST_VALUE = "best_value"

class ProductFeedRequest(BaseModel):
    offset: int = 0
    limit: int = 20
    search: Optional[str] = None
    category: Optional[str] = None
    merchant_ids: Optional[List[int]] = None
    sort_by: SortOptions = SortOptions.PRICE
    user_lat: Optional[float] = None
    user_long: Optional[float] = None

class ProductOffer(BaseModel):
    sku_id: int
    price: float
    amount: int
    merchant_id: int
    merchant_name: str
    stock_id: int
    stock_address: str
    distance_km: Optional[float] = None
    stock_lat: float
    stock_long: float

class ProductFeedItem(BaseModel):
    ean: int
    name: str
    category: str
    weight: float
    offers: List[ProductOffer]
    best_offer: Optional[ProductOffer] = None
    min_price: float
    max_price: float

class ProductInfo(BaseModel):
    ean: int
    name: str
    category: str

class ProductOffersResponse(BaseModel):
    product: ProductInfo
    offers: List[ProductOffer]
    best_offer: Optional[ProductOffer] = None

class CategoriesResponse(BaseModel):
    categories: List[str]

class MerchantsResponse(BaseModel):
    merchants: List[Dict[str, Any]]

class ProductFeedData(BaseModel):
    products: List[ProductFeedItem]
    total_count: int
    offset: int
    limit: int

# Main Response Models
class SuccessResponse(BaseModel):
    status: str = "success"
    message: str

class ProductFeedResponse(SuccessResponse):
    data: ProductFeedData

class CategoriesListResponse(SuccessResponse):
    data: CategoriesResponse

class MerchantsListResponse(SuccessResponse):
    data: MerchantsResponse

class ProductOffersListResponse(SuccessResponse):
    data: ProductOffersResponse