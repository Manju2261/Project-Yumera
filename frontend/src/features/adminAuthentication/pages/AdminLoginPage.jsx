import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import api from '../../../services/api'
import { setAdminCredentials } from '../../authentication/authSlice'
import AuthLayout from '../../authentication/components/AuthLayout'
import '../../authentication/pages/SignupPage.css'

//----------------------------------------------------------
// Admin login page
function AdminLoginPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        mode: 'onTouched'
    })

    // Authenticates the admin through the backend API
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/admin/login', {
                email: data.email,
                password: data.password
            })

            if (response.data.success) {
                dispatch(setAdminCredentials(response.data.admin))

                navigate('/admin/users', { replace: true })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Admin login failed. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout
            isAdmin={true}
            tagline="ADMINISTRATION CONSOLE"
            title="Secure Operations & Management Portal"
            subtext="AUTHORIZED ACCESS ONLY"
        >
            <div className="signup-form admin-login-form">
                <h1>YUMERA</h1>
                <p>The Essence of You.</p>
                <div className="admin-badge-pill">🛡️ ADMIN PORTAL</div>
                <h2>Control Center Access</h2>
                <p>Sign in with your administrator credentials.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter admin email"
                        {...register('email', {
                            required: 'Email is required',
                            validate: value => {
                                const trimmed = value.trim()
                                if (!trimmed) return 'Email is required'
                                if (!/^[a-zA-Z]/.test(trimmed)) {
                                    return 'Email must start with a letter'
                                }
                                if (!/^[a-zA-Z][a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
                                    return 'Email must have at least 5 characters before @ and be a valid format'
                                }
                                return true
                            }
                        })}
                    />
                    <p className="error-message">{errors.email?.message}</p>

                    <label>Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            maxLength={30}
                            placeholder="Enter your password"
                            {...register('password', {
                                required: 'Password is required',
                                validate: value => {
                                    if (value.length < 8) return 'Password must be at least 8 characters'
                                    if (value.length > 30) return 'Password cannot exceed 30 characters'
                                    return true
                                }
                            })}
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <p className="error-message">{errors.password?.message}</p>

                    {serverError && (
                        <p className="error-message">{serverError}</p>
                    )}

                    <button type="submit" className="admin-submit-btn" disabled={isLoading}>
                        {isLoading ? 'AUTHENTICATING...' : 'AUTHENTICATE & ENTER →'}
                    </button>
                </form>
                <p className="auth-signin">
                    <Link to="/">← Return to Storefront</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default AdminLoginPage
