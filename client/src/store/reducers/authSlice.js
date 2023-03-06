import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSlice } from "@reduxjs/toolkit";

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        token: "",
        isLoading: true,
        isLoggedIn: false,
        user: {}
    },
    reducers: {
        loginUser: (state, action) => {
            state.isLoggedIn = true
            state.isLoading = false;
            const token = action.payload;
            // state.token = token
            state.token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2M2QyODY0NGE1MGM4NWUyZjQ5OGQwZGIiLCJ1c2VybmFtZSI6InBzcGlhZ2ljdyIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4MTYyMzkwMjJ9.Dt9mEbL6DJkd2OyyEzNQ8VOsGOIvMLR8UZt8VwLjTqg"
            AsyncStorage.setItem('@token', token)
        },
        logoutUser: (state) => {
            AsyncStorage.removeItem('@token')
            state.isLoggedIn = false;
            state.token = "";
        },
        setLoaded: (state) => {
            state.isLoading = false;
        },
        setLoading: (state) => {
            state.isLoading = true;
        }
    }
})
export const { loginUser, logoutUser, setLoaded, setLoading } = authSlice.actions

export default authSlice.reducer