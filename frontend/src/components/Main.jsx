import React, { useEffect, useState } from 'react';
import Head from './ui/Head';
import setting from '../assets/system_preferences_setting_nut_icon_259571.svg';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, setFilters, selectProducts, selectCategories, selectProductsLoading, selectFilters } from '../slices/products';
import AddToCart from './AddToCart.jsx';

export default function Main() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const products = useSelector(selectProducts);
    console.log(products)
    const categories = useSelector(selectCategories);
    const isLoading = useSelector(selectProductsLoading);
    const filters = useSelector(selectFilters);
    
    const [isSettingsHovered, setIsSettingsHovered] = useState(false);
    const [error, setError] = useState(null);

    

    // Отладочная информация
    useEffect(() => {
        console.log('Products in component:', products);
        console.log('Loading state:', isLoading);
        console.log('Filters:', filters);
    }, [products, isLoading, filters]);

    // Загрузка данных при монтировании
    useEffect(() => {
        console.log('Fetching products and categories...');
        dispatch(fetchProducts())
            .unwrap()
            .then(result => {
                console.log('Products fetched successfully:', result);
            })
            .catch(err => {
                console.error('Error fetching products:', err);
                setError('Ошибка загрузки товаров');
            });
        
        dispatch(fetchCategories())
            .unwrap()
            .then(result => {
                console.log('Categories fetched successfully:', result);
            })
            .catch(err => {
                console.error('Error fetching categories:', err);
            });
            
        getLocation();
    }, [dispatch]);

    // Получение геолокации
    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Got location:', position.coords);
                    const newFilters = {
                        ...filters,
                        user_lat: position.coords.latitude,
                        user_long: position.coords.longitude
                    };
                    dispatch(setFilters(newFilters));
                    dispatch(fetchProducts(newFilters));
                },
                (error) => {
                    console.warn('Geolocation error:', error);
                    // Продолжаем без геолокации
                    dispatch(fetchProducts(filters));
                }
            );
        } else {
            console.warn('Geolocation not supported');
            dispatch(fetchProducts(filters));
        }
    };

    // Обработчики фильтров
    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value, offset: 0 };
        console.log('Changing filter:', key, value);
        dispatch(setFilters(newFilters));
        dispatch(fetchProducts(newFilters));
    };

    const handleSearch = (searchTerm) => {
        console.log('Searching for:', searchTerm);
        handleFilterChange('search', searchTerm);
    };

    const handleCategorySelect = (category) => {
        console.log('Selecting category:', category);
        handleFilterChange('category', category);
    };

    const handleSortChange = (sortBy) => {
        console.log('Changing sort to:', sortBy);
        handleFilterChange('sort_by', sortBy);
    };

    const navigateToProduct = (product) => {
        navigate(`/product` , product);
};

const useFoodImages = () => {
    const foodImages = [
    "https://foodish-api.com/images/burger/burger1.jpg",
    "https://foodish-api.com/images/pizza/pizza1.jpg",
    "https://foodish-api.com/images/pasta/pasta1.jpg", 
    "https://foodish-api.com/images/biryani/biryani60.jpg",
    "https://foodish-api.com/images/dosa/dosa49.jpg",
    "https://foodish-api.com/images/dessert/dessert1.jpg",
    'https://foodish-api.com/images/pizza/pizza55.jpg',
    'https://foodish-api.com/images/pizza/pizza55.jpg'
];

    const getRandomFoodImage = (seed) => {
        // Используем EAN или индекс как seed для постоянства картинки
        const seedValue = seed ? String(seed).split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
        const randomIndex = (seedValue % foodImages.length);
        return foodImages[randomIndex];
    };

    return { getRandomFoodImage };
};
    // Рендер продуктов с улучшенной отладкой
    const renderProducts = () => {
        console.log('Rendering products, count:', products?.length);
        
        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-24 h-24 mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-red-600 mb-2">Ошибка загрузки</h3>
                    <p className="text-gray-600 max-w-sm">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                        Обновить страницу
                    </button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                    <span className="ml-3 text-gray-600">Загрузка товаров...</span>
                </div>
            );
        }

        if (!products || products.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-24 h-24 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Товары не найдены</h3>
                    <p className="text-gray-400 max-w-sm">
                        Попробуйте изменить параметры поиска или фильтры.
                        <br />
                        Проверьте консоль для отладки.
                    </p>
                </div>
            );
        }

        const { getRandomFoodImage } = useFoodImages();

    return products.map((product, index) => {
        const imageUrl = product.image_url 
            ? product.image_url 
            : getRandomFoodImage(product.ean || index);

        return (
            <div
                key={product.ean || `product-${index}`}
                className="group bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-yellow-200 transform hover:-translate-y-1"
            >
                <div className="relative overflow-hidden">
                    <img
                        className="w-full h-60 object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                        src={imageUrl}
                        alt={product.name}
                        onClick={() => navigateToProduct(product)}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x200/FFD700/000000?text=Вкусная+Еда";
                        }}
                    />
                    {product.best_offer && (
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
                            <svg className="w-3 h-3 fill-current text-amber-700" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs font-bold text-gray-800">
                                4.5
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                            <span className="text-2xl font-bold text-black">
                                от {product.min_price || product.price} ₽
                            </span>
                            {product.max_price > product.min_price && (
                                <span className="text-sm text-gray-500 block">
                                    до {product.max_price} ₽
                                </span>
                            )}
                        </div>
                        <div className="">
                            <h3 className="font-bold text-lg text-black mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors cursor-pointer"
                                onClick={() => navigateToProduct(product.ean)}>
                                {product.name || 'Без названия'}
                            </h3>
                            <p className="text-xs text-gray-400 block">
                                магазин: {product.best_offer.merchant_name || 'Без категории'}
                            </p>
                            <p className="text-xs text-gray-400 block">
                                категория: {product.category || 'Без категории'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {product.offers_count || product.offers?.length || 0} предложений
                            </p>
                        </div>
                    </div>
                    <AddToCart product={product} />
                </div>
            </div>
        );
    });
};

    return (
        <div className='bg-white min-h-screen'>
            <Head onSearch={handleSearch} />
            
            {/* Отладочная информация 
            <div className="max-w-7xl mx-auto px-4 py-2 bg-yellow-50 border-b border-yellow-200">
                <div className="text-sm text-yellow-800">
                    <strong>Отладка:</strong> Продукты: {products?.length || 0} | 
                    Загрузка: {isLoading ? 'да' : 'нет'} | 
                    Ошибка: {error || 'нет'}
                </div>
            </div>*/}

            {/* Панель фильтров и сортировки */}
            <div className="text-black bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 flex items-center space-x-3">
                    {/* Настройки фильтров */}
                    <div
                        className="relative"
                        onMouseEnter={() => setIsSettingsHovered(true)}
                        onMouseLeave={() => setIsSettingsHovered(false)}
                    >
                        <div className="w-7 h-7 bg-white rounded-full cursor-pointer hover:bg-gray-100 transition-colors">
                            <img className="w-7 h-7" src={setting} alt="Настройки" />
                        </div>

                        {/* Модальное окно настроек */}
                        {isSettingsHovered && (
                            <div className="absolute left-0 top-6 z-50 w-110 bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                                <h3 className="font-bold text-lg text-gray-900 mb-3">Настройки ленты</h3>

                                <div className="space-y-4">
                                    {/* Сортировка */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Сортировка
                                        </label>
                                        <select
                                            value={filters.sort_by || 'price'}
                                            onChange={(e) => handleSortChange(e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                                        >
                                            <option value="price">По цене</option>
                                            <option value="distance">По расстоянию</option>
                                            <option value="best_value">Лучшее предложение</option>
                                        </select>
                                    </div>

                                    <div className="flex space-x-2 pt-2">
                                        <button 
                                            className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                                            onClick={() => setIsSettingsHovered(false)}
                                        >
                                            Применить
                                        </button>
                                        <button
                                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                                            onClick={() => setIsSettingsHovered(false)}
                                        >
                                            Закрыть
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Категории */}
                    <div className="flex space-x-8 overflow-x-auto py-3 hide-scrollbar">
                        <button 
                            className={`flex-shrink-0 text-sm font-medium transition-colors whitespace-nowrap ${
                                !filters.category ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-400'
                            }`}
                            onClick={() => handleCategorySelect('')}
                        >
                            Все товары
                        </button>
                        {categories && categories.map((category, index) => (
                            <button
                                key={index}
                                className={`flex-shrink-0 text-sm font-medium transition-colors whitespace-nowrap ${
                                    filters.category === category ? 'text-yellow-400' : 'text-gray-700 hover:text-yellow-400'
                                }`}
                                onClick={() => handleCategorySelect(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {renderProducts()}
                </div>
            </main>
        </div>
    );
}