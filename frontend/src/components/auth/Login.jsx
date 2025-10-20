import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAuth, selectIsAuth } from '../../slices/auth';
import { useNavigate, Link } from 'react-router-dom';
import { IoMail, IoLockClosed, IoArrowForward } from "react-icons/io5";
import Head from '../ui/Head'
import { IoMdArrowRoundBack} from "react-icons/io";
import { authAPI } from '../../services/api';

export default function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isAuth = useSelector(selectIsAuth);
    const [email, setMail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isAuth) {
            navigate('/');
        }
    }, [isAuth, navigate]);

    const HandlerSubmit = async () => {
        if (!email || !password) {
            return alert('Пожалуйста, заполните все поля');
        }

        setIsLoading(true);
        const userAuth = { email, password };
        
        try {
            // Используем прямой вызов API вместо dispatch, если нужно
            const response = await authAPI.login(userAuth);
            const data = response.data;
            
            console.log('Login response:', data);

            if (!data.access_token) {
                alert('Не удалось авторизоваться! Проверьте правильность данных');
                return;
            }
            
            // Сохраняем токен и данные пользователя
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userData', JSON.stringify({
                user_id: data.user_id,
                email: email
            }));
            
            // Если используете Redux, диспатчим успешную авторизацию
            if (dispatch) {
                dispatch({ type: 'auth/loginSuccess', payload: data });
            }
            
            navigate('/');
            
        } catch (error) {
            console.error('Auth error:', error);
            const errorMessage = error.response?.data?.message || 'Произошла ошибка при авторизации';
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

    if (isAuth) {
        return null;
    }

    return (
      <div className="bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-300">
        <Head />
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center flex items-center justify-center gap-20 mr-30">   
                  <div className="w-10 h-10 bg-white rounded-full cursor-pointer hover:bg-amber-50 transition-colors flex justify-center items-center shadow-md">
                       <IoMdArrowRoundBack className='text-[#ebcf31] w-6 h-6' onClick={go_main}/>
                  </div>
                     <h2 className="text-3xl font-bold text-gray-900 mb-2 w-40">Войдите в свой аккаунт</h2>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-amber-200">
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
                                value={email}
                                onChange={(e) => setMail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="block w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl 
                                         bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                                         transition-colors placeholder-gray-400 text-black"
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="block w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl 
                                         bg-amber-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 
                                         transition-colors placeholder-gray-400 text-black"
                                placeholder="Введите пароль"
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
                                <span>Войти</span>
                                <IoArrowForward className="w-4 h-4" />
                            </>
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-amber-100">
                        <p className="text-gray-600">
                            Ещё нет аккаунта?{' '}
                            <Link 
                                to="/registr" 
                                className="text-amber-600 hover:text-amber-700 font-semibold transition-colors"
                            >
                                Зарегистрироваться
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}