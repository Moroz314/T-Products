import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaTruckFast, FaDollarSign, FaFire } from 'react-icons/fa6';
import AddToCart from './AddToCart.jsx';

const ProductImage = ({ imageUrl, title }) => (
    <div className="md:w-1/2">
        <img
            className="w-full h-full object-cover"
            src={imageUrl}
            alt={title}
        />
    </div>
);

const ProductHeader = ({ title, about }) => (
    <>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600 text-lg mb-6">{about}</p>
    </>
);

const NutritionalInfo = ({ mass, calories, fats, proteins, carbohydrates }) => (
    <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Пищевая ценность (на 100г)</h3>
        <div className="grid grid-cols-2 gap-4 text-gray-700">
            <div className="bg-gray-50 p-3 rounded-lg">
                <strong>Масса:</strong> {mass} г
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
                <strong>Калории:</strong> {calories} ккал
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
                <strong>Жиры:</strong> {fats} г
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
                <strong>Белки:</strong> {proteins} г
            </div>
            <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                <strong>Углеводы:</strong> {carbohydrates} г
            </div>
        </div>
    </div>
);

const ProducersList = ({ producers, chosenMerchant, setChosenMerchant }) => {
    if (!producers || producers.length === 0) {
        return (
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Цены от производителей</h3>
                <p className="text-gray-500">Нет доступных предложений</p>
            </div>
        );
    }

    const bestPrice = producers.reduce((min, current) => current.price < min.price ? current : min, producers[0]);
    const fastestDelivery = producers.reduce((min, current) => current.deliveryMinutes < min.deliveryMinutes ? current : min, producers[0]);
    const sortedProducers = [...producers].sort((a, b) => a.deliveryMinutes !== b.deliveryMinutes ? a.deliveryMinutes - b.deliveryMinutes : a.price - b.price);

    return (
        <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Цены от производителей</h3>
            <ul className="space-y-3 max-h-[292px] overflow-y-auto">
                {sortedProducers.map((producer, index) => {
                    const isCheapest = producer === bestPrice;
                    const isFastest = producer === fastestDelivery;
                    const isBestOverall = isCheapest && isFastest;

                    return (
                        <li
                            key={index}
                            className={`flex justify-between items-center p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${chosenMerchant === producer.name ? 'bg-amber-50 border-amber-200' : 'bg-white'}`}
                            onClick={() => setChosenMerchant(producer.name)}
                        >
                            <div className="flex items-center">
                                <span className="font-medium text-gray-800">{producer.name}</span>
                                {isBestOverall && <FaFire className="ml-2 text-red-500" title="Самый дешевый и быстрый" />}
                                {!isBestOverall && isCheapest && <FaDollarSign className="ml-2 text-green-500" title="Самый дешевый" />}
                                {!isBestOverall && isFastest && <FaTruckFast className="ml-2 text-blue-500" title="Самый быстрый" />}
                            </div>
                            <span>
                                <span className="font-bold text-lg text-green-500">{producer.price} ₽ </span>
                                <span className="font-bold text-lg text-blue-500">{producer.deliveryMinutes} мин</span>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const ProductCard = () => {
    const navigate = useNavigate();
    const location = useLocation(); // ✅ Добавляем useLocation
    
    // Получаем данные из state навигации
    const productData = location.state?.product;
    console.log(productData.img, 'productData')

    if (!productData) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-white">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-600 mb-4">Товар не найден</h2>
                    <button 
                        onClick={() => navigate(-1)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg"
                    >
                        Вернуться назад
                    </button>
                </div>
            </div>
        );
    }

    const [chosenMerchant, setChosenMerchant] = useState(
        productData.producers?.[0]?.name || null
    );

    // Создаем объект product для AddToCart
    const selectedProducer = productData.producers?.find(p => p.name === chosenMerchant);
    
    const product = {
        name: productData.title,
        ean: productData.ean || "1234567890123",
        best_offer: selectedProducer ? {
            sku_id: Date.now(),
            price: selectedProducer.price,
            merchant_name: selectedProducer.name,
            delivery_minutes: selectedProducer.deliveryMinutes
        } : null,
        category: productData.category || "Продукты",
        image_url: productData.img
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center h-full w-full bg-white z-50">
            <div className="w-full h-full bg-white rounded-none shadow-none overflow-auto font-sans">
                {/* Кнопка назад */}
                <div className="absolute top-4 left-4 p-2 z-10 bg-white rounded-full cursor-pointer hover:bg-amber-50 transition-colors flex justify-center items-center shadow-md">
                    <IoMdArrowRoundBack 
                        className='text-[#ebcf31] w-6 h-6' 
                        onClick={() => navigate(-1)} 
                    />
                </div>
                
                <div className="md:flex h-full">
                    {/* Изображение продукта */}
                    <ProductImage 
                        imageUrl={productData.img} 
                        title={productData.title} 
                    />
                    
                    {/* Информация о продукте */}
                    <div className="md:w-1/2 p-8">
                        {/* Заголовок и описание */}
                        <ProductHeader 
                            title={productData.title} 
                            about={productData.about} 
                        />
                        
                        {/* Пищевая ценность */}
                        <NutritionalInfo
                            mass={productData.mass}
                            calories={productData.calories}
                            fats={productData.fats}
                            proteins={productData.proteins}
                            carbohydrates={productData.carbohydrates}
                        />
                        
                        {/* Список производителей */}
                        <ProducersList
                            producers={productData.producers}
                            chosenMerchant={chosenMerchant}
                            setChosenMerchant={setChosenMerchant}
                        />
                        
                        {/* Выбранный производитель */}
                        {chosenMerchant && (
                            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <h4 className="font-semibold text-amber-800 mb-2">Выбранный продавец:</h4>
                                <p className="text-amber-900">{chosenMerchant}</p>
                                <p className="text-green-600 font-bold">{selectedProducer?.price} ₽</p>
                                <p className="text-blue-600">Доставка: {selectedProducer?.deliveryMinutes} мин</p>
                            </div>
                        )}
                        
                        {/* Компонент добавления в корзину */}
                        <AddToCart product={productData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;