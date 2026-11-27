import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom'
import HomePage from './features/home/pages/HomePage'
import SignupPage from './features/authentication/pages/SignupPage'
import LoginPage from './features/authentication/pages/LoginPage'
import VerifyOTPPage from './features/authentication/pages/VerifyOTPPage'
import ForgotPasswordPage from './features/authentication/pages/ForgotPasswordPage'
import ResetPasswordPage from './features/authentication/pages/ResetPasswordPage'
import ProfilePage from './features/userProfile/pages/ProfilePage'
import EditProfilePage from './features/userProfile/pages/EditProfilePage'
import ChangePasswordPage from './features/userProfile/pages/ChangePasswordPage'
import AddressListPage from './features/addressManagement/pages/AddressListPage'
import AddAddressPage from './features/addressManagement/pages/AddAddressPage'
import EditAddressPage from './features/addressManagement/pages/EditAddressPage'
import ChangeEmailPage from './features/userProfile/pages/ChangeEmailPage'
import AdminLoginPage from './features/adminAuthentication/pages/AdminLoginPage'
import AdminUsersPage from './features/adminUserManagement/pages/AdminUsersPage'
import { GoogleOAuthProvider } from "@react-oauth/google"

import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import api from './services/api'
import {
    setCredentials,
    logout,
    setAdminCredentials,
    adminLogout
} from './features/authentication/authSlice'


//--------------------------------------------------------------
// Protected User Route.

function ProtectedUserRoute({ children, sessionLoading, isAuthenticated }) {
    if (sessionLoading) {
        return <p>Loading...</p>
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Redirects authenticated users away from guest-only pages.
function GuestRoute({ children, sessionLoading, isAuthenticated, redirectTo = "/" }) {
    if (sessionLoading) {
        return <p>Loading...</p>
    }

    return isAuthenticated ? <Navigate to={redirectTo} replace /> : children
}

// Protected Admin Route.
function ProtectedAdminRoute({ children, sessionLoading, isAdminAuthenticated }) {
    if (sessionLoading) {
        return <p>Loading...</p>
    }

    return isAdminAuthenticated
        ? children
        : <Navigate to="/admin/login" replace />
}

//------------------------------------------------------------------------------------

function App() {
    const [sessionLoading, setSessionLoading] = useState(true)
    const dispatch = useDispatch()

    // Reads user and admin authentication status from Redux.
    const { isAuthenticated, isAdminAuthenticated } = useSelector(
        (state) => state.auth
    )
    // Restores user and admin sessions when the application loads.
    useEffect(() => {
        const restoreSessions = async () => {
            // Restores the user session.
            try {
                const userResponse = await api.get('/auth/profile')
                dispatch(setCredentials(userResponse.data.user))
            } catch {
                dispatch(logout())
            }

            // Restores the admin session.
            try {
                const adminResponse = await api.get('/admin/me')
                dispatch(setAdminCredentials(adminResponse.data.admin))
            } catch {
                dispatch(adminLogout())
            }
            setSessionLoading(false)
        }

        restoreSessions()
    }, [dispatch])

    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <BrowserRouter>
                {/* Defines public, guest-only, and protected application routes. */}
                <Routes>
                    {/* Public route */}
                    <Route path="/" element={<HomePage />} />

                    {/* Guest-only routes */}
                    <Route
                        path="/signup"
                        element={
                            <GuestRoute
                                sessionLoading={sessionLoading}
                                isAuthenticated={isAuthenticated}
                            >
                                <SignupPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/login"
                        element={
                            <GuestRoute
                                sessionLoading={sessionLoading}
                                isAuthenticated={isAuthenticated}
                            >
                                <LoginPage />
                            </GuestRoute>
                        }
                    />

                    {/* Public authentication flow routes */}
                    <Route path="/verify-otp" element={<VerifyOTPPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    {/* Protected user routes */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedUserRoute sessionLoading={sessionLoading} isAuthenticated={isAuthenticated}>
                                <ProfilePage />
                            </ProtectedUserRoute>
                        }
                    />
                    <Route
                        path="/profile/edit"
                        element={
                            <ProtectedUserRoute sessionLoading={sessionLoading} isAuthenticated={isAuthenticated}>
                                <EditProfilePage />
                            </ProtectedUserRoute>
                        }
                    />
                    <Route
                        path="/profile/change-password"
                        element={
                            <ProtectedUserRoute sessionLoading={sessionLoading} isAuthenticated={isAuthenticated}>
                                <ChangePasswordPage />
                            </ProtectedUserRoute>
                        }
                    />
                    <Route
                        path="/profile/change-email"
                        element={
                            <ProtectedUserRoute sessionLoading={sessionLoading} isAuthenticated={isAuthenticated}>
                                <ChangeEmailPage />
                            </ProtectedUserRoute>
                        }
                    />
                    <Route
                        path="/addresses"
                        element={
                            <ProtectedUserRoute sessionLoading={sessionLoading} isAuthenticated={isAuthenticated}>
                                <AddressListPage />
                            </ProtectedUserRoute>
                        }
                    />
                    <Route
                        path="/address/add"
                        element={
                            <ProtectedUserRoute sessionLoading={sessionLoading} isAuthenticated={isAuthenticated}>
                                <AddAddressPage />
                            </ProtectedUserRoute>
                        }
                    />
                    <Route
                        path="/address/edit/:id"
                        element={
                            <ProtectedUserRoute sessionLoading={sessionLoading} isAuthenticated={isAuthenticated}>
                                <EditAddressPage />
                            </ProtectedUserRoute>
                        }
                    />

                    {/* Admin routes */}
                    <Route
                        path="/admin/login"
                        element={
                            <GuestRoute
                                sessionLoading={sessionLoading}
                                isAuthenticated={isAdminAuthenticated}
                                redirectTo="/admin/users"
                            >
                                <AdminLoginPage />
                            </GuestRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedAdminRoute
                                sessionLoading={sessionLoading}
                                isAdminAuthenticated={isAdminAuthenticated}
                            >
                                <AdminUsersPage />
                            </ProtectedAdminRoute>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </GoogleOAuthProvider>
    )
}

export default App