import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Proxy } from '@/app/entities/Proxy';
import { RootState } from '../store';

interface ProxyState {
  proxies: Proxy[];
  loading: boolean;
  error: string | null;
}

const initialState: ProxyState = {
  proxies: [],
  loading: false,
  error: null,
};

const proxySlice = createSlice({
  name: 'proxy',
  initialState,
  reducers: {
    setProxies: (state, action: PayloadAction<Proxy[]>) => {
      state.proxies = action.payload;
      state.error = null;
    },
    addProxy: (state, action: PayloadAction<Proxy>) => {
      state.proxies.push(action.payload);
    },
    updateProxy: (state, action: PayloadAction<Proxy>) => {
      const index = state.proxies.findIndex(
        proxy => proxy._id === action.payload._id || proxy.id === action.payload.id
      );
      if (index !== -1) {
        state.proxies[index] = action.payload;
      }
    },
    removeProxy: (state, action: PayloadAction<string>) => {
      state.proxies = state.proxies.filter(
        proxy => proxy._id !== action.payload && proxy.id !== action.payload
      );
    },
    setProxyLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setProxyError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearProxyError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setProxies,
  addProxy,
  updateProxy,
  removeProxy,
  setProxyLoading,
  setProxyError,
  clearProxyError,
} = proxySlice.actions;

// Selectores
export const selectProxies = (state: RootState) => state.proxy.proxies;
export const selectProxyLoading = (state: RootState) => state.proxy.loading;
export const selectProxyError = (state: RootState) => state.proxy.error;

export default proxySlice.reducer; 