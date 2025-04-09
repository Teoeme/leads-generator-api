import { Account } from "@/app/entities/Account";
import { createSlice } from "@reduxjs/toolkit";

export const  accountsSlice = createSlice({
  name: 'accounts',
  initialState: {
    accounts: null as Account[] | null,
    isAuthenticated: false,
    isLoading: true,
    error: null as string | null,
  },
  reducers: {
    setAccounts: (state, action) => {
      state.accounts = action.payload;
    },
   
    
  },
});

export const { setAccounts } = accountsSlice.actions;
export default accountsSlice.reducer;