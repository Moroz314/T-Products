import random
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .database.models import Base, Products, ProductsStock, Merchants, \
    Stocks  # замените your_module на имя вашего файла
from .database.core import get_db, engine

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
session = Session()


def generate_random_merchants_and_stocks(num_merchants=5):
    """Генерирует случайных мерчантов и склады"""

    merchants = []
    stocks = []

    # Создаем мерчантов с более подходящими названиями
    merchant_names = ["ФрешМарт", "Продуктовый рай", "СуперЕда", "Гурман", "Деликатесы"]

    for i in range(num_merchants):
        merchant_name = merchant_names[i] if i < len(merchant_names) else f"Продуктовый магазин {i + 1}"
        merchant = Merchants(
            name=merchant_name,
            email=f"merchant{i + 1}@example.com",
            password=f"password{i + 1}"
        )
        merchants.append(merchant)

    session.add_all(merchants)
    session.commit()
    print(f"Добавлено мерчантов: {len(merchants)}")

    # Список случайных адресов в Москве
    addresses_list = [
        "ул. Тверская, д. 15",
        "пр-т Мира, д. 42",
        "ул. Арбат, д. 28",
        "Ленинградский пр-т, д. 64",
        "ул. Новый Арбат, д. 19",
        "ул. Покровка, д. 32",
        "ул. Большая Дмитровка, д. 11",
        "ул. Мясницкая, д. 24",
        "ул. Рождественка, д. 8",
        "ул. Никольская, д. 13",
        "ул. Ильинка, д. 5",
        "ул. Варварка, д. 9",
        "ул. Пречистенка, д. 17",
        "ул. Остоженка, д. 22",
        "ул. Знаменка, д. 7",
        "ул. Волхонка, д. 14",
        "ул. Манежная, д. 3",
        "ул. Моховая, д. 12",
        "ул. Воздвиженка, д. 6",
        "ул. Большая Якиманка, д. 21"
    ]

    # Создаем склады для каждого мерчанта
    stock_counter = 1
    for merchant in merchants:
        num_stocks_for_merchant = random.randint(1, 3)  # 1-3 склада на мерчанта
        for j in range(num_stocks_for_merchant):
            stock = Stocks(
                id=stock_counter,
                address=random.choice(addresses_list),
                lat=round(random.uniform(55.0, 56.0), 6),
                long=round(random.uniform(37.0, 38.0), 6),
                merchant_id=merchant.id
            )
            stocks.append(stock)
            stock_counter += 1

    session.add_all(stocks)
    session.commit()
    print(f"Добавлено складов: {len(stocks)}")

    # Возвращаем список ID существующих складов
    stock_ids = [stock.id for stock in stocks]
    print(f"Доступные ID складов: {stock_ids}")
    return stock_ids


def generate_random_products(num_products=50):
    """Генерирует случайные продукты для супермаркета"""

    categories = [
        'Молочные продукты', 'Мясо и птица', 'Рыба и морепродукты',
        'Овощи и фрукты', 'Бакалея', 'Хлеб и выпечка',
        'Напитки', 'Замороженные продукты', 'Консервы',
        'Сладости и снеки', 'Личная гигиена', 'Бытовая химия'
    ]

    product_names = [
        # Молочные продукты
        'Молоко', 'Йогурт', 'Сметана', 'Творог', 'Сыр', 'Кефир', 'Сливочное масло',
        # Мясо и птица
        'Куриная грудка', 'Говядина', 'Свинина', 'Фарш', 'Колбаса', 'Сосиски',
        # Рыба и морепродукты
        'Лосось', 'Треска', 'Креветки', 'Мидии', 'Сельдь',
        # Овощи и фрукты
        'Яблоки', 'Бананы', 'Помидоры', 'Огурцы', 'Картофель', 'Морковь', 'Лук',
        # Бакалея
        'Рис', 'Гречка', 'Макароны', 'Мука', 'Сахар', 'Соль',
        # Хлеб и выпечка
        'Хлеб белый', 'Хлеб черный', 'Булочки', 'Пирожки',
        # Напитки
        'Сок', 'Вода', 'Газировка', 'Чай', 'Кофе',
        # Замороженные продукты
        'Пельмени', 'Овощи замороженные', 'Мороженое',
        # Консервы
        'Тушенка', 'Рыбные консервы', 'Огурцы консервированные',
        # Сладости и снеки
        'Шоколад', 'Печенье', 'Чипсы', 'Сухарики',
        # Личная гигиена
        'Мыло', 'Шампунь', 'Зубная паста', 'Туалетная бумага',
        # Бытовая химия
        'Стиральный порошок', 'Средство для мытья посуды', 'Чистящее средство'
    ]

    brands = [
        'Простоквашино', 'Домик в деревне', 'Активиа', 'Чудо', 'President',
        'Мираторг', 'Царь-продукт', 'Петелинка', 'Индилайт',
        'Ашан', 'Магнит', 'Пятерочка', 'Лента', 'Перекресток',
        'Nestle', 'Coca-Cola', 'Pepsi', 'Lipton', 'Jacobs',
        'Барни', 'Красный Октябрь', 'Бабаевский', 'Рот Фронт',
        'Dove', 'Nivea', 'Head & Shoulders', 'Colgate', 'Blend-a-med',
        'Tide', 'Fairy', 'Comet', 'Миф', 'AOS'
    ]

    products = []

    for i in range(num_products):
        ean = f'{random.randint(1000000000000, 9999999999999)}'
        category = random.choice(categories)
        product_name = random.choice(product_names)
        brand = random.choice(brands)
        name = f"{brand} {product_name}"

        # Разный вес в зависимости от категории
        if category in ['Овощи и фрукты', 'Мясо и птица', 'Рыба и морепродукты']:
            weight = round(random.uniform(0.1, 5.0), 2)  # кг
        elif category in ['Молочные продукты', 'Напитки']:
            weight = round(random.uniform(0.2, 2.0), 2)  # литры/кг
        else:
            weight = round(random.uniform(0.05, 2.0), 2)  # кг

        product = Products(
            ean=ean,
            name=name,
            category=category,
            weight=weight
        )
        products.append(product)

    session.add_all(products)
    session.commit()
    print(f"Добавлено продуктов: {len(products)}")
    return products


def generate_random_product_stocks(products, available_stock_ids):
    """Генерирует случайные записи о запасах продуктов"""

    product_stocks = []
    sku_counter = 1

    for product in products:
        # Для каждого продукта создаем записи в случайных складах из доступных
        num_stocks_for_product = random.randint(1, min(3, len(available_stock_ids)))
        selected_stock_ids = random.sample(available_stock_ids, num_stocks_for_product)

        for stock_id in selected_stock_ids:
            # Разные ценовые диапазоны в зависимости от категории
            if product.category in ['Мясо и птица', 'Рыба и морепродукты']:
                price = round(random.uniform(100.0, 2000.0), 2)
            elif product.category in ['Личная гигиена', 'Бытовая химия']:
                price = round(random.uniform(50.0, 800.0), 2)
            else:
                price = round(random.uniform(10.0, 500.0), 2)

            amount = random.randint(0, 500)

            product_stock = ProductsStock(
                sku_id=sku_counter,
                product_ean=product.ean,
                stock_id=stock_id,  # Используем только существующие stock_id
                price=price,
                amount=amount
            )

            product_stocks.append(product_stock)
            sku_counter += 1

    return product_stocks


def populate_database():
    """Заполняет базу данных случайными данными"""

    try:
        # Сначала создаем мерчантов и склады, получаем список доступных stock_id
        print("Генерация мерчантов и складов...")
        available_stock_ids = generate_random_merchants_and_stocks(3)  # 3 мерчанта

        # Затем создаем продукты
        print("Генерация продуктов...")
        products = generate_random_products(15)  # 15 продуктов

        # Создаем запасы продуктов, используя только существующие stock_id
        print("Генерация запасов продуктов...")
        product_stocks = generate_random_product_stocks(products, available_stock_ids)

        session.add_all(product_stocks)
        session.commit()
        print(f"Добавлено записей о запасах: {len(product_stocks)}")

        print("База данных успешно заполнена!")

    except Exception as e:
        session.rollback()
        print(f"Ошибка при заполнении базы данных: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    populate_database()