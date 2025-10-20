import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LuMapPin } from "react-icons/lu";
import { ordersAPI } from '../../services/api';

export default function Head({ onSearch }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [userMap, setUserMap] = useState('Свердловская набережная, 44с2');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        checkAuthStatus();
        loadCartCount();
    }, []);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('userData');
        
        if (token && userData) {
            setIsAuthenticated(true);
            try {
                const user = JSON.parse(userData);
                setUserName(user.username || user.email || 'Пользователь');
            } catch (e) {
                setUserName('Пользователь');
            }
        } else {
            setIsAuthenticated(false);
            setUserName('');
        }
    };

    const loadCartCount = async () => {
        try {
            const response = await ordersAPI.getCart();
            if (response.data.status === 'success' && response.data.data) {
                setCartItemsCount(response.data.data.total_items || 0);
            }
        } catch (error) {
            console.error('Error loading cart count:', error);
            setCartItemsCount(0);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            onSearch(searchQuery);
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        setUserName('');
        setCartItemsCount(0);
        window.location.href = '/';
    };

    return (
        <div className=''>
            <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    {/* Первая строка - логотип и основные элементы */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 md:space-x-8">
                            <Link to='/'>
                                <div className="flex items-center space-x-3">
                                    <span className="text-black font-bold text-lg">
                                        <img 
                                            src="https://cdn.tbank.ru/static/pfa-multimedia/images/33447f85-5b92-42f9-8d88-509bd152b47c.svg" 
                                            alt="Логотип" 
                                            className="w-8 h-8 md:w-10 md:h-10"
                                        />
                                    </span>
                                    <span className="text-lg md:text-xl font-bold text-gray-900 hidden sm:block">
                                        Продукты
                                    </span>
                                </div>
                            </Link>

                            <nav className="hidden lg:flex items-center space-x-6">
                                <Link to='/catalog' className="text-gray-700 hover:text-yellow-400 font-medium transition-colors">
                                    Каталог
                                </Link>
                                <Link to='/about' className="text-gray-700 hover:text-yellow-400 font-medium transition-colors">
                                    О нас
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center space-x-3 md:space-x-4">
                            {/* Профиль или Войти */}
                            {isAuthenticated ? (
                                <div className="relative group">
                                    <button className="hidden sm:flex items-center space-x-2 p-2 text-gray-600 hover:text-yellow-400 transition-colors">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="hidden lg:block text-sm font-medium truncate max-w-24">
                                            {userName}
                                        </span>
                                    </button>
                                    
                                    <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                        <Link 
                                            to="/profile" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            👤 Мой профиль
                                        </Link>
                                       
                                        <button 
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                                        >
                                            🚪 Выйти
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to='/login'>
                                    <button className="hidden sm:flex items-center space-x-2 p-2 text-gray-600 hover:text-yellow-400 transition-colors">
                                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="hidden lg:block text-sm font-medium">Войти</span>
                                    </button>
                                </Link>
                            )}

                            {/* Корзина */}
                            <Link to='/basket'>
                                <button className="relative p-2 text-gray-600 hover:text-yellow-400 transition-colors">
                                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartItemsCount > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                            {cartItemsCount}
                                        </span>
                                    )}
                                </button>
                            </Link>

                            {/* Карта - на мобильных только иконка */}
                            <Link to='/map'>
                                <button className="flex items-center space-x-1 md:space-x-2 p-2 text-gray-600 hover:text-yellow-400 transition-colors">
                                    <LuMapPin className='w-5 h-5 md:w-6 md:h-6' />
                                    <span className="hidden md:block text-sm font-medium truncate max-w-32 lg:max-w-48">
                                        {userMap}
                                    </span>
                                </button>
                            </Link>

                            {/* Кнопка мобильного меню */}
                            <button
                                className="lg:hidden p-2 text-gray-600 hover:text-yellow-400 transition-colors"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                            >
                                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Вторая строка - поиск для всех устройств */}
                    <div className="mt-4 md:mt-0 md:flex md:justify-center">
                        <div className="w-full max-w-2xl">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 md:h-5 md:w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Найти продукты..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onKeyPress={handleSearch}
                                    className="w-full pl-10 pr-20 py-2 md:py-3 border-2 border-gray-200 rounded-xl
                                        focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200
                                        transition-all duration-200 bg-white text-black text-sm md:text-base"
                                />
                                <button 
                                    onClick={handleSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-yellow-400 text-sm md:text-base"
                                >
                                    Найти
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Мобильное меню */}
                    {isMenuOpen && (
                        <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
                            <nav className="flex flex-col space-y-3">
                                <Link 
                                    to='/catalog' 
                                    className="text-gray-700 hover:text-yellow-400 font-medium py-2 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Каталог
                                </Link>
                                <Link 
                                    to='/about' 
                                    className="text-gray-700 hover:text-yellow-400 font-medium py-2 transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    О нас
                                </Link>
                                
                                {isAuthenticated ? (
                                    <>
                                        <Link 
                                            to='/profile' 
                                            className="text-gray-700 hover:text-yellow-400 font-medium py-2 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Мой профиль
                                        </Link>
                                        <Link 
                                            to='/orders' 
                                            className="text-gray-700 hover:text-yellow-400 font-medium py-2 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Мои заказы
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="text-left text-red-600 hover:text-red-700 font-medium py-2 transition-colors"
                                        >
                                            Выйти
                                        </button>
                                    </>
                                ) : (
                                    <div className="pt-2">
                                        <Link to='/login' onClick={() => setIsMenuOpen(false)}>
                                            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-xl transition-colors">
                                                Войти в аккаунт
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </nav>
                        </div>
                    )}
                </div>
            </header>
        </div>
    );
}