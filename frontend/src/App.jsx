import { BrowserRouter, Routes, Route } from 'react-router-dom'
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

function App()
{ 
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/verify-otp" element={<VerifyOTPPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/profile/change-password" element={<ChangePasswordPage />} />
                <Route path="/addresses" element={<AddressListPage />} />
                <Route path="/address/add" element={<AddAddressPage />} />
                <Route path="/address/edit/:id" element={<EditAddressPage />} />
                <Route path="/profile/change-email" element={<ChangeEmailPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App