
import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        admin: null,
        isAdminAuthenticated: false,
        loading: false,
        error: null
    },

    // Handles authentication state changes
    reducers: {
        setCredentials: (state, action) => {
            state.user = action.payload
            state.isAuthenticated = true
            state.error = null
        },

        logout: (state) => {
            state.user = null
            state.isAuthenticated = false
            state.error = null
        },

        setAdminCredentials: (state, action) => {
            state.admin = action.payload
            state.isAdminAuthenticated = true
            state.error = null
        },

        adminLogout: (state) => {
            state.admin = null
            state.isAdminAuthenticated = false
            state.error = null
        },

        setLoading: (state, action) => {
            state.loading = action.payload
        }
    }
})

export const 
    {
        setCredentials, 
        logout, 
        setAdminCredentials,
        adminLogout,
        setLoading
    } = authSlice.actions
export default authSlice.reducer
