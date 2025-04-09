import { Campaign } from "@/app/entities/Campaign";
import { createSlice } from "@reduxjs/toolkit";

export const  campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: {
    campaigns: null as Campaign[] | null,
    isAuthenticated: false,
    isLoading: true,
    error: null as string | null,
  },
  reducers: {
    setCampaigns: (state, action) => {
      state.campaigns = action.payload;
    },
   
    
  },
});

export const { setCampaigns } = campaignsSlice.actions;
export default campaignsSlice.reducer;