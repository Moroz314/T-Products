from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy import Column, String, Integer, ForeignKey, Float, DateTime, BigInteger
from datetime import datetime, UTC

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String)
    email = Column(String)
    password = Column(String)

    orders = relationship("Orders", back_populates="user")  # Исправлено: было "product"


class Products(Base):
    __tablename__ = 'products'

    ean = Column(BigInteger, primary_key=True)
    name = Column(String)
    category = Column(String)
    weight = Column(Float)


    stocks = relationship("ProductsStock", back_populates="product")


class ProductsStock(Base):
    __tablename__ = "products_stock"

    sku_id = Column(Integer, primary_key=True, autoincrement=True)
    product_ean = Column(BigInteger, ForeignKey("products.ean"))
    stock_id = Column(Integer, ForeignKey("stocks.id"))
    price = Column(Float)
    amount = Column(Integer)

    product = relationship("Products", back_populates="stocks")
    stock = relationship("Stocks", back_populates="products")


class Orders(Base):
    __tablename__ = 'orders'

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.now(UTC))
    delivery_method = Column(String)
    address = Column(String)
    status = Column(String, default="unconfirmed")


    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")


class OrderItem(Base):
    __tablename__ = 'order_items'

    id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey('orders.id'))
    sku_id = Column(Integer, ForeignKey('products_stock.sku_id'))
    quantity = Column(Integer, default=1)

    order = relationship("Orders", back_populates="items")
    product_stock = relationship("ProductsStock")


class Merchants(Base):
    __tablename__ = 'merchants'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String)
    email = Column(String)
    password = Column(String)

    stocks = relationship("Stocks", back_populates="merchant")


class Stocks(Base):
    __tablename__ = 'stocks'

    id = Column(Integer, primary_key=True, autoincrement=True)
    address = Column(String)
    lat = Column(Float)
    long = Column(Float)
    merchant_id = Column(Integer, ForeignKey('merchants.id'))

    merchant = relationship("Merchants", back_populates="stocks")
    products = relationship("ProductsStock", back_populates="stock")