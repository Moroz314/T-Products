import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoMail, IoLockClosed, IoPerson, IoArrowForward } from "react-icons/io5";
import Head from '../ui/Head';
import { IoMdArrowRoundBack} from "react-icons/io";
import { authAPI, ordersAPI } from '../../services/api';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const HandlerSubmit = async () => {
        const { username, email, password } = formData;

        if (!username || !email || !password) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        if (password.length < 6) {
            alert('Пароль должен содержать минимум 6 символов');
            return;
        }

        setIsLoading(true);

        const userData = {
            username,
            email,
            password
        };

        try {
            // 1. Регистрируем пользователя
            const response = await authAPI.register(userData);
            
            console.log('Registration response:', response.data);

            if (response.data.access_token) {
                const token = response.data.access_token;
                const userId = response.data.user_id;
                
                // Сохраняем токен и данные пользователя
                localStorage.setItem('token', token);
                localStorage.setItem('userData', JSON.stringify({
                    user_id: userId,
                    username: username,
                    email: email
                }));

                // 2. Создаем корзину для нового пользователя с токеном
                try {
                    console.log('Creating cart for new user with token...');
                    
                    // Создаем временный экземпляр axios с токеном
                    const createCartResponse = await fetch('/cart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (createCartResponse.ok) {
                        const cartData = await createCartResponse.json();
                        console.log(cartData, 'cart data')
                        localStorage.setItem('order_id', cartData.id);
                        console.log('Cart created successfully:', cartData);
                        alert('Вы успешно зарегистрированы! Корзина создана.');
                    } else {
                        throw new Error(`HTTP error! status: ${createCartResponse.status}`);
                    }
                    
                } catch (cartError) {
                    console.warn('Cart creation failed, but registration successful:', cartError);
                    alert('Вы успешно зарегистрированы! Корзина будет создана при первом добавлении товара.');
                }

                // 3. Переходим на главную страницу
                navigate('/');
                
            } else {
                alert('Регистрация прошла успешно, но не получен токен доступа');
                navigate('/login');
            }

        } catch (error) {
            console.error('Registration error:', error);
            const errorMessage = error.response?.data?.detail?.[0]?.msg || 
                               error.response?.data?.message || 
                               'Произошла ошибка при регистрации';
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            HandlerSubmit();
        }
    };

    function go_main(){
        navigate('/');
    }

    return (
        <div className=" bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-300">
           <Head />
           <div className='min-h-screen flex items-center justify-center p-4'>
            <div className="max-w-md w-full space-y-8">
                <div className="text-center flex items-center justify-center gap-20 mr-30">
                   <div className="w-10 h-10 bg-white rounded-full cursor-pointer hover:bg-amber-50 transition-colors flex justify-center items-center shadow-md">
                       <IoMdArrowRoundBack className='text-[#ebcf31] w-6 h-6' onClick={go_main}/>
                   </div>
                   <div className="">
                     <h2 className="text-3xl font-bold text-gray-900 mb-2">
                         Регистрация
                     </h2>
                     <p className="text-gray-700">Создайте новый аккаунт</p>
                   </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-amber-200">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Полное имя
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IoPerson className="h-5 w-5 text-amber-500" />
                            </div>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => handleChange('username', e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="text-black block w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl
                                         bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                                         transition-colors placeholder-gray-400"
                                placeholder="Введите ваше имя"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Электронная почта
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IoMail className="h-5 w-5 text-amber-500" />
                            </div>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="text-black block w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl
                                         bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                                         transition-colors placeholder-gray-400"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Пароль
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <IoLockClosed className="h-5 w-5 text-amber-500" />
                            </div>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="text-black block w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl
                                         bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500
                                         transition-colors placeholder-gray-400"
                                placeholder="Минимум 6 символов"
                            />
                        </div>
                    </div>

                    <button
                        onClick={HandlerSubmit}
                        disabled={isLoading}
                       className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600
                        text-white font-bold py-3 px-6 rounded-xl transition-all duration-200
                        shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]
                        disabled:from-gray-200 disabled:to-gray-300 disabled:text-gray-400
                        disabled:hover:scale-100 disabled:cursor-not-allowed
                        flex items-center justify-center space-x-2"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Зарегистрироваться</span>
                                <IoArrowForward className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-amber-100">
                        <p className="text-gray-600">
                            Уже есть аккаунт?{' '}
                            <Link
                                to="/login"
                                className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                            >
                                Войти
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div></div>
    );
}