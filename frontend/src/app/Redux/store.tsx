import { configureStore } from '@reduxjs/toolkit';
import userSlice from './Slices/userSlice';
import accountsSlice from './Slices/accountsSlice';
import modalSlice  from './Slices/modalSlice';
import formSlice from './Slices/formSlice';
import campaignsSlice from './Slices/campaignSlice';
import proxySlice from './Slices/proxySlice';

export const store = configureStore({
  reducer: {
    user: userSlice,
    accounts: accountsSlice,
    modals: modalSlice,
    forms: formSlice,
    campaigns: campaignsSlice,
    proxy: proxySlice
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

