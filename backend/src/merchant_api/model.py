from pydantic import BaseModel


class Product(BaseModel):
    ean: str
    name: str
    category: str
    weight: str


class ProductToStock(BaseModel):
    product_ean: str
    price: float
    amount: int


