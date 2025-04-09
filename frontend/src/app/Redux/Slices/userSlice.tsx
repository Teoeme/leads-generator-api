import { createSlice } from "@reduxjs/toolkit";
import { User } from "../../entities/User";

export const  userSlice = createSlice({
  name: 'user',
  initialState: {
    user: null as User | null,
    isAuthenticated: false,
    isLoading: true,
    error: null as string | null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setIsAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
  },
});

export const { setUser, setIsAuthenticated, setIsLoading } = userSlice.actions;
export default userSlice.reducer;