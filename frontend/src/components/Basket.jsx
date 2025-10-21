import React, { useState, useEffect } from 'react';
import Head from './ui/Head';
import { IoMdArrowRoundBack, IoMdPin, IoMdCart, IoMdAdd, IoMdRemove, IoMdTrash } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

export default function Basket() {
    const navigate = useNavigate();
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [userAddress, setUserAddress] = useState("ул. Пушкина, 10, кв. 25");
    const [orderItems, setOrderItems] = useState([])

    // Загрузка корзины с API
   const loadCart = async () => {
    try {
        
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('User not authenticated');
            setCart(null);
            return;
        }

        const response = await ordersAPI.getCart();
        console.log(response)
        console.log('Cart API response:', response.data);
        
        if (response.status === 200) {
            // Если корзина найдена
            if (response.data) {
                setCart(response.data);
                gtOrder(response.data.id)
            } else {
                // Корзины нет, создаем новую
                try {
                    const createResponse = await ordersAPI.createCart();
                    console.log('New cart created:', createResponse.data);
                    // После создания получаем корзину снова
                    const newCartResponse = await ordersAPI.getCart();
                    setCart(newCartResponse.data.data);
                } catch (createError) {
                    console.error('Error creating cart:', createError);
                    setCart(null);
                }
            }
        } else {
            setCart(null);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        if (error.response?.status === 404) {
            // Корзины нет - создаем новую
            try {
                const createResponse = await ordersAPI.createCart();
                const newCartResponse = await ordersAPI.getCart();
                setCart(newCartResponse.data.data);
            } catch (createError) {
                console.error('Error creating cart:', createError);
                setCart(null);
            }
        } else if (error.response?.status === 401) {
            console.log('User not authorized');
            setCart(null);
        } else {
            console.error('Other error:', error);
            setCart(null);
        }
    } finally {
        setIsLoading(false);
    }
};

    const gtOrder = async (id_order) => {

        try {
            const data = await ordersAPI.getOrderItems(id_order)
            console.log(data)
            
        } catch (error) {
            
        }
    }

    // Обновление количества товара
    const updateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        
        try {
            setIsUpdating(true);
            await ordersAPI.updateOrderItem(itemId, { quantity: newQuantity });
            await loadCart();
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Ошибка при обновлении количества');
        } finally {
            setIsUpdating(false);
        }
    };

    // Удаление товара из корзины
    const removeItem = async (itemId) => {
        try {
            setIsUpdating(true);
            await ordersAPI.deleteOrderItem(itemId);
            await loadCart();
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Ошибка при удалении товара');
        } finally {
            setIsUpdating(false);
        }
    };

    // Оформление заказа
 const createOrder = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
        alert('Корзина пуста');
        return;
    }

    try {
        setIsLoading(true);
        const orderData = {
            order_id: cart.id,
            address: userAddress,
            delivery_method: 'courier',
            status: 'confirmed'
        };
        
        const response = await ordersAPI.createOrder(orderData);
        console.log(response, 'response');
        
        if (response.status === 200) {
            alert('Заказ успешно создан!');
            
            // Ждем немного перед созданием новой корзины
            await new Promise(resolve => setTimeout(resolve, 500));
            
            try {
                const createResponse = await ordersAPI.createCart();
                console.log('New cart created:', createResponse.data);
                
                // Ждем обновления на сервере
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Принудительно обновляем корзину с timestamp для избежания кэширования
                const timestamp = new Date().getTime();
                const newCartResponse = await ordersAPI.getCart();
                console.log(newCartResponse, 'должны быть новая корзина');
                
                // ОБНОВЛЯЕМ СОСТОЯНИЕ
                setCart(newCartResponse.data.data || newCartResponse.data);
                
            } catch (createError) {
                console.error('Error creating cart:', createError);
                setCart(null);
            }
            navigate('/profile');
        }
    } catch (error) {
        console.error('Error creating order:', error);
        alert('Ошибка при создании заказа');
    } finally {
        setIsLoading(false);
    }
};
    // Группировка товаров по магазинам
    const groupItemsByMerchant = () => {
        if (!cart || !cart.items) return [];
        
        const groups = {};
        
        cart.items.forEach(item => {
            const merchantName = item.merchant_name || 'Неизвестный магазин';
            if (!groups[merchantName]) {
                groups[merchantName] = {
                    merchant_name: merchantName,
                    items: [],
                    total: 0
                };
            }
            
            const itemTotal = item.total_price || (item.price * item.quantity);
            groups[merchantName].items.push({
                ...item,
                total_price: itemTotal
            });
            groups[merchantName].total += itemTotal;
        });
        
        return Object.values(groups);
    };

    // Форматирование цены
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU').format(price);
    };
    async function GET_CART (){
        const data = await ordersAPI.getCart();
        console.log('get cart',data)
    }

    // ДЕЙСТВИТЕЛЬНО ЗАГРУЖАЕМ КОРЗИНУ ПРИ МОНТИРОВАНИИ КОМПОНЕНТА
    useEffect(() => {
        console.log('Basket component mounted, loading cart...');
        loadCart();
        GET_CART()
    }, []);

    function go_main(){
        navigate('/');
    }

    const merchantGroups = groupItemsByMerchant();
    const overallTotal = cart?.total_amount || 0;
    const totalItems = cart?.total_items || 0;

    if (isLoading) {
        return (
            <div className='min-h-screen bg-white'>
                <Head />
                <main className="max-w-4xl mx-auto px-4 py-6">
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
                        <span className="ml-3 text-gray-600">Загрузка корзины...</span>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-white'>
            <Head />
            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Заголовок и кнопка назад */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-white rounded-full cursor-pointer hover:bg-amber-50 transition-colors flex justify-center items-center shadow-md">
                            <IoMdArrowRoundBack className='text-[#ebcf31] w-6 h-6' onClick={go_main}/>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <IoMdCart className="mr-3 text-amber-700" />
                            Моя корзина
                            {totalItems > 0 && (
                                <span className="ml-3 bg-yellow-400 text-black text-sm rounded-full px-2 py-1 font-semibold">
                                    {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
                                </span>
                            )}
                        </h1>
                    </div>
                </div>

                {/* Пустая корзина */}
                {(!cart || !cart.items || cart.items.length === 0) && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-amber-200">
                        <IoMdCart className="w-20 h-20 text-amber-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Корзина пуста</h2>
                        <p className="text-gray-600 mb-6">Добавьте товары из каталога, чтобы сделать заказ</p>
                        <button 
                            onClick={() => navigate('/')}
                            className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                        >
                            Перейти к покупкам
                        </button>
                    </div>
                )}

                {/* Если корзина не пустая */}
                {cart && cart.items && cart.items.length > 0 && (
                    <>
                        {/* Информация о корзине */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-amber-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <IoMdCart className="text-amber-600 w-6 h-6" />
                                    <div>
                                        <p className="text-sm text-gray-600">Номер корзины</p>
                                        <p className="font-semibold text-gray-900">#{cart.id || cart.order_id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Способ доставки</p>
                                    <p className="font-semibold text-gray-900">
                                        {cart.delivery_method === 'courier' ? 'Доставка курьером' : 
                                         cart.delivery_method === 'pickup' ? 'Самовывоз' : 
                                         'Не указан'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Адрес доставки */}
                        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-amber-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <IoMdPin className="text-amber-600 w-6 h-6" />
                                    <div>
                                        <p className="text-sm text-gray-600">Адрес доставки</p>
                                        <p className="font-semibold text-gray-900">{userAddress}</p>
                                    </div>
                                </div>
                                <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-md transform hover:scale-[1.02] active:scale-[0.98]">
                                    Изменить 
                                </button>
                            </div>
                        </div>

                        {/* Список магазинов и товаров */}
                        <div className="space-y-6">
                            {merchantGroups.map((store, index) => (
                                <div key={store.merchant_name || index} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-200">
                                    {/* Заголовок магазина */}
                                    <div className="bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4">
                                        <h2 className="text-xl font-bold text-white">{store.merchant_name}</h2>
                                    </div>
                                    
                                    {/* Список товаров */}
                                    <div className="divide-y divide-amber-100">
                                        {store.items.map((item) => (
                                            <div key={item.id} className="p-4 hover:bg-amber-50 transition-colors">
                                                <div className="flex items-center space-x-4">
                                                    {/* Изображение товара */}
                                                    <div className="w-16 h-16 bg-amber-200 rounded-xl flex items-center justify-center shadow-inner">
                                                        {item.product_image ? (
                                                            <img 
                                                                src={item.product_image} 
                                                                alt={item.product_name}
                                                                className="w-12 h-12 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <IoMdCart className="text-amber-600 w-8 h-8" />
                                                        )}
                                                    </div>
                                                    
                                                    {/* Информация о товаре */}
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                                                                {item.category && (
                                                                    <p className="text-xs text-gray-500 mt-1">Категория: {item.category}</p>
                                                                )}
                                                                {item.sku_id && (
                                                                    <p className="text-xs text-gray-500">Артикул: {item.sku_id}</p>
                                                                )}
                                                            </div>
                                                            <button 
                                                                onClick={() => removeItem(item.id)}
                                                                disabled={isUpdating}
                                                                className="text-red-500 hover:text-red-700 transition-colors p-1"
                                                            >
                                                                <IoMdTrash className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <button 
                                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                    disabled={isUpdating || item.quantity <= 1}
                                                                    className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <IoMdRemove className="text-amber-700 w-4 h-4" />
                                                                </button>
                                                                <span className="font-medium text-gray-900 min-w-8 text-center">
                                                                    {isUpdating ? '...' : item.quantity}
                                                                </span>
                                                                <button 
                                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                    disabled={isUpdating}
                                                                    className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center hover:bg-amber-300 transition-colors disabled:opacity-50"
                                                                >
                                                                    <IoMdAdd className="text-amber-700 w-4 h-4" />
                                                                </button>
                                                            </div>
                                                            <div className="text-right">
                                                                <span className="font-bold text-amber-700 text-lg">
                                                                    {formatPrice(item.total_price || (item.price * item.quantity))} ₽
                                                                </span>
                                                                <div className="text-sm text-gray-500">
                                                                    {formatPrice(item.price)} ₽ × {item.quantity}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Итого по магазину */}
                                    <div className="px-6 py-4 bg-amber-50 border-t border-amber-200">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-gray-700">Итого за {store.merchant_name}:</span>
                                            <span className="text-xl font-bold text-amber-700">
                                                {formatPrice(store.total)} ₽
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Общая сумма и кнопка заказа */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mt-6 border border-amber-200 sticky bottom-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <span className="text-lg font-semibold text-gray-900 block">Общая сумма:</span>
                                    <span className="text-sm text-gray-600">
                                        {totalItems} {totalItems === 1 ? 'товар' : totalItems < 5 ? 'товара' : 'товаров'}
                                    </span>
                                </div>
                                <span className="text-2xl font-bold text-amber-700">
                                    {formatPrice(overallTotal)} ₽
                                </span>
                            </div>
                            <button 
                                onClick={createOrder}
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    'Оформить заказ'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}