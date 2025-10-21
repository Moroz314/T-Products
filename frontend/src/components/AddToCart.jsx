import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

export default function AddToCart({ product }) {
    const [isLoading, setIsLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const navigate = useNavigate();
    const [isInCart, setIsInCart] = useState(false);
    const [cartItemId, setCartItemId] = useState(null);
    const [currentQuantity, setCurrentQuantity] = useState(0);
    const [checkingCart, setCheckingCart] = useState(true);

    // Проверяем, есть ли товар в корзине при загрузке компонента
    useEffect(() => {
        checkIfInCart();
    }, [product]);

    // Функция для проверки наличия товара в корзине
    const checkIfInCart = async () => {
        try {
            setCheckingCart(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setCheckingCart(false);
                return;
            }

            const cartResponse = await ordersAPI.getCart();
            const cart = cartResponse.data.data || cartResponse.data;
            
            if (cart && cart.items) {
                const existingItem = cart.items.find(item => 
                    item.sku_id === product.best_offer.sku_id
                );
                
                if (existingItem) {
                    setIsInCart(true);
                    setCartItemId(existingItem.id);
                    setCurrentQuantity(existingItem.quantity);
                } else {
                    setIsInCart(false);
                    setCartItemId(null);
                    setCurrentQuantity(0);
                }
            }
        } catch (error) {
            console.error('Error checking cart:', error);
            setIsInCart(false);
        } finally {
            setCheckingCart(false);
        }
    };

    // Функция для добавления товара в корзину
    const handleAddToCart = async () => {
        if (!product.best_offer) {
            alert('Нет доступных предложений для этого товара');
            return;
        }

        setIsLoading(true);
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Для добавления товаров в корзину необходимо войти в систему');
                navigate('/login');
                return;
            }

            let cart;
            let cartId;
            
            try {
                const cartResponse = await ordersAPI.getCart();
                cart = cartResponse.data.data || cartResponse.data;
                cartId = cart.id;
            } catch (error) {
                if (error.response?.status === 404) {
                    const createResponse = await ordersAPI.createCart();
                    cart = createResponse.data.data || createResponse.data;
                    cartId = cart.id;
                } else {
                    throw error;
                }
            }

            // Добавляем товар в корзину
            await ordersAPI.addOrderItem(cartId, {
                sku_id: product.best_offer.sku_id,
                quantity: quantity
            });

            // ВАЖНО: После добавления товара получаем обновленную корзину
            // чтобы узнать cartItemId нового товара
            const updatedCartResponse = await ordersAPI.getCart();
            const updatedCart = updatedCartResponse.data.data || updatedCartResponse.data;
            
            if (updatedCart && updatedCart.items) {
                const newItem = updatedCart.items.find(item => 
                    item.sku_id === product.best_offer.sku_id
                );
                
                if (newItem) {
                    setIsInCart(true);
                    setCartItemId(newItem.id);
                    setCurrentQuantity(newItem.quantity);
                }
            }
            
            // Обновляем счетчик в заголовке
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (error) {
            console.error('Error adding to cart:', error);
            
            if (error.response?.status === 401) {
                alert('Ошибка авторизации. Пожалуйста, войдите снова.');
                localStorage.removeItem('token');
                navigate('/login');
            } else {
                alert('Ошибка при добавлении товара в корзину');
            }
        } finally {
            setIsLoading(false);
        }
    };

// Функция для увеличения количества
const handleIncrease = async () => {
    if (!cartItemId) return;
    
    setIsLoading(true);
    try {
        const newQuantity = currentQuantity + 1;
        // Передаем объект { quantity: число }
        await ordersAPI.updateOrderItem(cartItemId, newQuantity);
        setCurrentQuantity(newQuantity);
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
        console.error('Error increasing quantity:', error);
        alert('Ошибка при обновлении количества');
    } finally {
        setIsLoading(false);
    }
};

// Функция для уменьшения количества
const handleDecrease = async () => {
    if (!cartItemId) return;
    
    setIsLoading(true);
    try {
        const newQuantity = currentQuantity - 1;
        
        if (newQuantity === 0) {
            await ordersAPI.deleteOrderItem(cartItemId);
            setIsInCart(false);
            setCartItemId(null);
            setCurrentQuantity(0);
        } else {
            // Передаем объект { quantity: число }
            await ordersAPI.updateOrderItem(cartItemId, newQuantity);
            setCurrentQuantity(newQuantity);
        }
        
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
        console.error('Error decreasing quantity:', error);
        alert('Ошибка при обновлении количества');
    } finally {
        setIsLoading(false);
    }
};

    // Функция для удаления товара из корзины
    const handleRemoveFromCart = async () => {
        if (!cartItemId) return;
        
        setIsLoading(true);
        try {
            await ordersAPI.deleteOrderItem(cartItemId);
            setIsInCart(false);
            setCartItemId(null);
            setCurrentQuantity(0);
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error('Error removing from cart:', error);
            alert('Ошибка при удалении товара из корзины');
        } finally {
            setIsLoading(false);
        }
    };

    // Показываем loader пока проверяем корзину
    if (checkingCart) {
        return (
            <div className="mt-4">
                <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-yellow-400 rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between">
                {isInCart ? (
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1">
                            <button
                                onClick={handleDecrease}
                                disabled={isLoading}
                                className="w-6 h-6 text-black bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold"
                            >
                                -
                            </button>
                            <span className="w-8 text-center font-medium text-sm text-black">
                                {isLoading ? '...' : currentQuantity}
                            </span>
                            <button
                                onClick={handleIncrease}
                                disabled={isLoading}
                                className="w-6 h-6 text-black bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm font-bold"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={handleRemoveFromCart}
                            disabled={isLoading}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            Удалить
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-3">
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
                        </button>
                    </div>
                )}
            </div>
            {!product.best_offer && (
                <p className="text-xs text-red-500 mt-2">Нет в наличии</p>
            )}
        </div>
    );
}