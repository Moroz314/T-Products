from fastapi import APIRouter, Depends
from .service import *
from .model import *
from ..dependencies import get_merchant_product_service

merchant_router = APIRouter(prefix="/merchant")

@merchant_router.post("/add/product/stock/{stock_id}",
                      summary="Регистрация товара поставщиком",
                      description="Поставщик отправляет товар на склад"
)
def add_product_to_stock(
        stock_id: int,
        product: ProductToStock,
        merchant: MerchantProductService = Depends(get_merchant_product_service)):

    merchant.add_product_to_stock(stock_id, product)







