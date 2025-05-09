import { Lead } from "@/app/entities/Lead";
import { createSlice } from "@reduxjs/toolkit";

export const  leadSlice = createSlice({
  name: 'leads',
  initialState: {
    list: [] as Lead[] | null,
    isLoading: true,
    error: null as string | null,
  },
  reducers: {
    setLeads: (state, action) => {
      state.list = action.payload;
    },
   
    
  },
});

export const { setLeads } = leadSlice.actions;
export default leadSlice.reducer;