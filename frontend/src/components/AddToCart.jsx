import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

export default function AddToCart({ product }) {
    const [isLoading, setIsLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const [shet, setShet] = useState(0)
    const [tov_to_corz, setTov_cors] = useState(false)

    // Функция для создания корзины через создание заказа


    const addToCart = (productId, prev) => {


        const existingItem = prev.find(item => item.sku_id === productId);
            if (existingItem) {
                prev.map(item =>
                    item.sku_id === productId
                        ? { ...item, quantity: item.quantity + 1 ,}
                        : item
                );
                return setTov_cors(!tov_to_corz)
            } else {
                return [...prev, { _id: productId, quantity: 1 }];
            }
    };




    const createCartViaOrder = async () => {
        try {
            console.log('Creating cart via order creation...');
            const orderResponse = await ordersAPI.createOrder({
                delivery_method: 'pickup' // или 'courier'
            });
            console.log('Cart created via order:', orderResponse.data);
            return orderResponse.data.data;
        } catch (error) {
            console.error('Error creating cart via order:', error);
            throw error;
        }
    };

    const handleAddToCart = async () => {
        if (!product.best_offer) {
            alert('Нет доступных предложений для этого товара');
            return;
        }

        setIsLoading(true);
        
        try {
            // Проверяем авторизацию
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Для добавления товаров в корзину необходимо войти в систему');
                navigate('/login');
                return;
            }

            console.log('Adding to cart:', {
                product: product.name,
                sku_id: product.best_offer.sku_id,
                quantity: quantity
            });

            let cart;
            let cartId;
            
            try {
                // Пытаемся получить существующую корзину
                const cartResponse = await ordersAPI.getCart();
                cart = cartResponse.data;
                console.log(cartResponse)
                cartId = cart.id
                console.log('Existing cart found:', cart);
            } catch (error) {
                if (error.response?.status === 404 || error.response?.status === 500) {
                    console.log('No cart found, creating new one via order...');
                    try {
                        cart = await createCartViaOrder();
                        cartId = cart.order_id || cart.id;
                        console.log('New cart created via order:', cart);
                    } catch (createError) {
                        console.error('Error creating cart:', createError);
                        
                        alert('Не удалось создать корзину. Используется демо-режим.');
                        return;
                    }
                } else {
                    throw error;
                }
            }

            // Добавляем товар в корзину
            await ordersAPI.addOrderItem(cartId, {
                sku_id: product.best_offer.sku_id,
                quantity: quantity
            });
            const cartt = await ordersAPI.getCart();
            const items = cartt.data.items
            const cart_id = cartt.id
            console.log(items, 'awefawefwaf')
            addToCart(cart_id, items)
            console.log(tov_to_corz, 'продукты в карзине')
            
            // Обновляем счетчик в заголовке
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (error) {
            console.error('Error adding to cart:', error);
            
            if (error.response?.status === 401) {
                alert('Ошибка авторизации. Пожалуйста, войдите снова.');
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                navigate('/login');
            } else if (error.response?.status === 404) {
                alert('Корзина не найдена. Пожалуйста, попробуйте снова.');
            } else {
                alert('Ошибка при добавлении товара в корзину. Используется демо-режим.');
                console.log("waefawef")
            }
        } finally {
            setIsLoading(false);
        }
    };

 
    return (
        <div className="mt-4">
            <div className="flex items-center justify-between">
                {tov_to_corz ? (
                
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={isLoading || quantity <= 1}
                        className="w-8 h-8 text-black bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        -
                    </button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={isLoading}
                        className="w-8 h-8 text-black bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                        +
                    </button>
                </div>) : (
                <button
                    onClick={handleAddToCart}
                    disabled={isLoading || !product.best_offer}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>Добавляем...</span>
                        </>
                    ) : (
                        'В корзину'
                    )}
                </button>)}
            </div>
            {!product.best_offer && (
                <p className="text-xs text-red-500 mt-2">Нет в наличии</p>
            )}
        </div>
    );
}