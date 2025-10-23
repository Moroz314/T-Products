from pydantic import BaseModel
from typing import List, Dict, Optional
from enum import Enum
from datetime import datetime

# Request Models
class OrderItemCreateRequest(BaseModel):
    sku_id: int
    quantity: int

class OrderItemUpdateRequest(BaseModel):
    quantity: int

class DeliveryMethod(str, Enum):
    COURIER = 'courier'
    PICKUP = 'pickup'

class OrderStatus(str, Enum):
    UNCONFIRMED = 'unconfirmed'
    CONFIRMED = 'confirmed'

class OrderCreateRequest(BaseModel):
    address: str
    delivery_method: DeliveryMethod
    status: OrderStatus

# Response Data Models
class OrderItemData(BaseModel):
    item_id: int
    order_id: int
    sku_id: int
    quantity: int

class OrderItemUpdateData(BaseModel):
    item_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    sku_id: int
    quantity: int
    product_name: str
    price: float
    merchant_name: str
    total_price: float


class CartResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    items: List[OrderItemResponse]
    total_amount: float
    total_items: int


class OrderResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    delivery_method: DeliveryMethod
    address: str
    status: OrderStatus
    items: List[OrderItemResponse]
    total_amount: float
    total_items: int

class OrderItemsData(BaseModel):
    order_id: int
    items: List[OrderItemResponse]
    total_amount: float
    total_items: int

class OrderListData(BaseModel):
    orders: List[OrderResponse]
    total_count: int
    limit: int
    offset: int

# Main Response Models
class SuccessResponse(BaseModel):
    status: str = "success"
    message: str

class OrderItemCreateResponse(SuccessResponse):
    data: OrderItemData

class OrderItemUpdateResponse(SuccessResponse):
    data: OrderItemUpdateData

class OrderItemDeleteResponse(SuccessResponse):
    pass

class OrderItemsListResponse(SuccessResponse):
    data: OrderItemsData

class OrderCreateData(BaseModel):
    order_id: int
    user_id: int
    address: str = None
    created_at: datetime
    delivery_method: DeliveryMethod = None
    status: str = "unconfirmed"

class OrderCreateInfo(BaseModel):
    address: str = None
    delivery_method: DeliveryMethod

class OrderCreateResponse(SuccessResponse):
    data: OrderCreateData

class OrderDetailResponse(SuccessResponse):
    data: Dict[str, OrderResponse]

class OrdersListResponse(SuccessResponse):
    data: OrderListData

class OrderDeleteResponse(SuccessResponse):
    pass

# Отдельные response модели для корзины
class CartDetailResponse(SuccessResponse):
    data: Dict[str, CartResponse]