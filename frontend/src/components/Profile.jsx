import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const navigate = useNavigate();

  // Демо-данные заказов
  const demoOrders = [
    {
      id: 1,
      created_at: '2024-01-15T10:30:00Z',
      status: 'delivered',
      total_amount: 3500,
      total_items: 5,
      delivery_method: 'courier',
      address: 'г. Москва, ул. Примерная, д. 1, кв. 5',
      items: [
        {
          id: 1,
          product_name: "Свежая говядина",
          price: 1000,
          quantity: 2,
          merchant_name: "Магазин 'Фруктовый рай'",
          product_image: "https://images.unsplash.com/photo-1588347818120-de7bb8e57abf?w=150"
        },
        {
          id: 2,
          product_name: "Куриное филе",
          price: 500,
          quantity: 3,
          merchant_name: "Магазин 'Фруктовый рай'",
          product_image: "https://images.unsplash.com/photo-1604503468506-8f6e0a0145c6?w=150"
        }
      ]
    },
    // ... остальные демо-заказы
  ];

  // Функция для нормализации данных заказа
  const normalizeOrderData = (order) => {
    return {
      ...order,
      delivery_method: order.delivery_method || 'pickup', // значение по умолчанию
      address: order.address || 'Адрес не указан',
      items: order.items || [],
      total_amount: order.total_amount || 0,
      total_items: order.total_items || 0,
      status: order.status || 'pending'
    };
  };

  // Загрузка данных пользователя
  useEffect(() => {
    loadUserData();
    loadUserOrders();
  }, []);

  const loadUserData = () => {
    try {
      const storedUserData = localStorage.getItem('userData');
      const token = localStorage.getItem('token');
      const location = localStorage.getItem('location_order');
      
      if (storedUserData && token) {
        const user = JSON.parse(storedUserData);
        setUserData({
          name: user.username || user.email?.split('@')[0] || 'Пользователь',
          email: user.email || 'email@example.com',
          phone: user.phone || '+7 (999) 123-45-67',
          address: location || 'г. Москва, ул. Примерная, д. 1, кв. 5'
        });
      } else {
        // Если нет данных, перенаправляем на логин
        navigate('/login');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Загрузка заказов пользователя с обработкой ошибок валидации
  const loadUserOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getUserOrders({
        limit: 50,
        offset: 0
      });
      
      console.log('Orders API response:', response.data);

      if (response.data.status === "success" && response.data.data.orders) {
        // Нормализуем данные каждого заказа
        const normalizedOrders = response.data.data.orders.map(normalizeOrderData);
        console.log(normalizedOrders)
        setOrders(normalizedOrders);
      } else {
        // Используем демо-данные если ответ не содержит заказов
        console.warn('No orders in response, using demo data');
        setOrders(demoOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      
      // Проверяем, является ли ошибка ошибкой валидации Pydantic
      if (error.response?.data?.detail) {
        const errorDetail = error.response.data.detail;
        if (typeof errorDetail === 'string' && errorDetail.includes('validation errors for OrderResponse')) {
          console.warn('Pydantic validation error, using demo data');
          setOrders(demoOrders);
          return;
        }
      }
      
      // Для других ошибок также используем демо-данные
      setOrders(demoOrders);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Альтернативная версия с более надежной обработкой ошибок
  const loadUserOrdersAlternative = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getUserOrders({
        limit: 50,
        offset: 0
      });
      
      console.log('Orders API response:', response);

      if (response.status === 200) {
        let ordersData = [];
        
        // Проверяем различные возможные структуры ответа
        if (Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.data && Array.isArray(response.data.orders)) {
          ordersData = response.data.orders;
        } else if (response.data && Array.isArray(response.data.items)) {
          ordersData = response.data.items;
        }
        
        if (ordersData.length > 0) {
          const normalizedOrders = ordersData.map(normalizeOrderData);
          setOrders(normalizedOrders);
        } else {
          console.warn('Empty orders array, using demo data');
          setOrders(demoOrders);
        }
      } else {
        console.warn('Non-200 response, using demo data');
        setOrders(demoOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      // Всегда используем демо-данные при любой ошибке
      setOrders(demoOrders);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Здесь можно добавить логику сохранения данных на бэкенд
    alert('Изменения сохранены (в демо-режиме)');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed': 
        return 'bg-green-100 text-green-800';
      case 'cancelled': 
        return 'bg-red-100 text-red-800';
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
      case 'completed': 
        return 'Доставлен';
      case 'cancelled': 
        return 'Отменен';
      case 'processing':
      case 'pending':
        return 'В обработке';
      default: 
        return status;
    }
  };

  const getDeliveryMethodText = (method) => {
    switch (method) {
      case 'courier':
        return 'Доставка курьером';
      case 'pickup':
        return 'Самовывоз';
      default:
        return 'Способ доставки не указан';
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Дата не указана';
    }
  };

  const repeatOrder = async (orderId) => {
    try {
      // Логика повторения заказа
      alert(`Повторение заказа #${orderId} (функциональность в разработке)`);
    } catch (error) {
      console.error('Error repeating order:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Мой профиль</h1>
          <p className="text-gray-600">Управляйте вашими данными и отслеживайте заказы</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Левая колонка - информация профиля */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-8">
              {/* Аватар */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xl">
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                  <p className="text-gray-500 text-sm">Покупатель</p>
                </div>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                  <div className="text-sm text-gray-500">Заказов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'delivered' || o.status === 'completed').length}
                  </div>
                  <div className="text-sm text-gray-500">Доставлено</div>
                </div>
              </div>

              {/* Навигация */}
              <nav className="space-y-2">
                <button className="w-full text-left px-4 py-3 bg-yellow-400 text-black font-semibold rounded-xl">
                  📋 История заказов
                </button>
                <Link 
                  to="/basket"
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  🛒 Корзина
                </Link>
                <Link 
                  to="/"
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  🏠 Главная
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  🚪 Выйти
                </button>
              </nav>
            </div>
          </div>

          {/* Правая колонка - детали профиля и заказы */}
          <div className="lg:col-span-2 space-y-6">
            {/* Карточка персональных данных */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Персональные данные</h3>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-yellow-400 hover:text-yellow-500 font-medium text-sm transition-colors"
                  >
                    Редактировать
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Имя</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{userData.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{userData.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{userData.phone}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Адрес доставки</label>
                  {isEditing ? (
                    <textarea
                      value={userData.address}
                      onChange={(e) => setUserData({...userData, address: e.target.value})}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 transition-all duration-200 resize-none"
                    />
                  ) : (
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-900">{userData.address}</div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleSave}
                      className="bg-black hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                      Сохранить изменения
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* История заказов */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">История заказов</h3>
                <button 
                  onClick={loadUserOrders}
                  className="text-yellow-400 hover:text-yellow-500 font-medium text-sm transition-colors"
                >
                  Обновить
                </button>
              </div>
              
              {ordersLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Заказов пока нет</h4>
                  <p className="text-gray-600 mb-4">Сделайте свой первый заказ!</p>
                  <Link 
                    to="/"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-6 rounded-xl transition-colors inline-block"
                  >
                    Перейти к покупкам
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    const normalizedOrder = normalizeOrderData(order);
                    return (
                      <div key={normalizedOrder.id} className="border-2 border-gray-100 rounded-xl p-4 hover:border-yellow-400 transition-colors">
                        {/* Шапка заказа */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="font-semibold text-gray-900">Заказ #{normalizedOrder.id}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(normalizedOrder.status)}`}>
                                {getStatusText(normalizedOrder.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              {formatDate(normalizedOrder.created_at)} • 
                              {getDeliveryMethodText(normalizedOrder.delivery_method)}
                            </p>
                            {normalizedOrder.address && normalizedOrder.address !== 'Адрес не указан' && (
                              <p className="text-sm text-gray-500 mt-1">{normalizedOrder.address}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{normalizedOrder.total_amount} ₽</div>
                            <p className="text-sm text-gray-500">{normalizedOrder.total_items} товаров</p>
                          </div>
                        </div>

                        {/* Товары в заказе */}
                        <div className="space-y-3">
                          {normalizedOrder.items.map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-12 h-12 bg-amber-200 rounded-lg flex items-center justify-center">
                                {item.product_image ? (
                                  <img 
                                    src={item.product_image} 
                                    alt={item.product_name}
                                    className="w-10 h-10 rounded object-cover"
                                  />
                                ) : (
                                  <span className="text-amber-600">📦</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.product_name}</h4>
                                <p className="text-sm text-gray-500">{item.merchant_name}</p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-gray-900">{item.price} ₽</div>
                                <div className="text-sm text-gray-500">× {item.quantity}</div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Действия */}
                        <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-100">
                          <button 
                            onClick={() => repeatOrder(normalizedOrder.id)}
                            className="text-yellow-400 hover:text-yellow-500 font-medium text-sm transition-colors"
                          >
                            Повторить заказ
                          </button>
                          {(normalizedOrder.status === 'delivered' || normalizedOrder.status === 'completed') && (
                            <button className="text-gray-600 hover:text-gray-700 font-medium text-sm transition-colors">
                              Оставить отзыв
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;