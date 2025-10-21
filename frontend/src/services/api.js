import axios from 'axios';

const API_BASE_URL = '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена к запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('🔐 Adding token to request:', config.url, 'Token:', token.substring(0, 20) + '...');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn('⚠️ No token found for request:', config.url);
  }
  return config;
});

// Интерцептор для логирования ответов
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response success:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.config?.url, error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

// API методы
export const authAPI = {
  login: (credentials) => api.post('/user/sign_in', credentials),
  register: (userData) => api.post('/user/register', userData),
  merchantLogin: (credentials) => api.post('/merchant/sign_in', credentials),
  merchantRegister: (merchantData) => api.post('/merchant/register', merchantData),
};

export const productsAPI = {
  getFeed: (params = {}) => {
    const defaultParams = {
      offset: 0,
      limit: 20,
      sort_by: 'price'
    };
    return api.get('/products/feed', { 
      params: { ...defaultParams, ...params } 
    });
  },
  getCategories: () => api.get('/products/categories'),
  getMerchants: () => api.get('/products/merchants'),
  getProductOffers: (ean, userLat, userLong) => 
    api.get(`/products/${ean}/offers`, { 
      params: { user_lat: userLat, user_long: userLong } 
    }),
  searchProducts: (query, params = {}) => 
    api.get('/products/search', { 
      params: { q: query, ...params } 
    }),
};

export const ordersAPI = {
  // КОРЗИНА
  getCart: () => api.get('/cart'),
  createCart: () => api.post('/cart'), // Новый эндпоинт для создания корзины
  
  // ЗАКАЗЫ
  createOrder: (orderData) => api.post('/order', orderData),
  createOrders: (orderData) => api.post('/orders', orderData),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  deleteOrder: (orderId) => api.delete(`/orders/${orderId}`),
  getUserOrders: (params = {}) => api.get('/users/orders', { params }),
  
  // ЭЛЕМЕНТЫ ЗАКАЗА
  getOrderItems: (orderId) => api.get(`/orders/${orderId}/items`),
  addOrderItem: (orderId, itemData) => api.post(`/orders/${orderId}/items`, itemData),
 updateOrderItem: (itemId, quantity) => api.put(`/order-items/${itemId}`, { quantity: quantity }),
  deleteOrderItem: (itemId) => api.delete(`/order-items/${itemId}`),
};

export const merchantAPI = {
  addProductToStock: (stockId, productData) => 
    api.post(`/merchant/add/product/stock/${stockId}`, productData),
};

export default api;