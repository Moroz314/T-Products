import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productsAPI } from '../services/api';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getFeed(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await productsAPI.getCategories();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    categories: [],
    filters: {
      search: '',
      category: '',
      merchant_ids: '',
      sort_by: 'price',
      offset: 0,
      limit: 20
    },
    isLoading: false,
    error: null,
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        search: '',
        category: '',
        merchant_ids: '',
        sort_by: 'price',
        offset: 0,
        limit: 20
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.data?.products || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.items = [];
      })
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data?.categories || [];
      });
  },
});

export const { setFilters, clearFilters } = productsSlice.actions;
export const selectProducts = (state) => state.products.items;
export const selectCategories = (state) => state.products.categories;
export const selectProductsLoading = (state) => state.products.isLoading;
export const selectFilters = (state) => state.products.filters;
export default productsSlice.reducer;