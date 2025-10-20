from ..database.repository import *
from .model import *
from fastapi.exceptions import HTTPException

class MerchantProductService:
    def __init__(self, merchant_id: int, product_repo: ProductRepository):
        self.merchant_id = merchant_id
        self.product_repo = product_repo


    def check_stock_id(self, stock_id):
        if not self.product_repo.check_stock_by_merchant_id(self.merchant_id, stock_id):
            raise HTTPException(
                status_code=403,
                detail="wrong stock id"
            )

    def add_product_to_stock(self, stock_id: int, product: ProductToStock):
        self.check_stock_id(stock_id)
        product = self.product_repo.add_to_stock(stock_id, dict(product))

        return product


    def update_product(self, stock_id: int, sku_id: int, data: ProductToStock):
        self.check_stock_id(stock_id)

        try:
            self.product_repo.update_product(sku_id=sku_id, data=dict(data))

        except Exception as e:
            print(e)
            raise

