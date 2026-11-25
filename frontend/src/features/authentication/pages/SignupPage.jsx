import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { GoogleLogin } from '@react-oauth/google'
import AuthLayout from '../components/AuthLayout'
import { setCredentials } from '../authSlice'
import api from '../../../services/api'
import './SignupPage.css'

//----------------------------------------------------
// Signup page

function SignupPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm({
        mode: 'onTouched'
    })

    // Sends the Google ID token to the backend for authentication
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/google-login', {
                idToken: credentialResponse.credential
            })

            if (response.data.success) {
                dispatch(setCredentials(response.data.user))
                navigate('/', { replace: true })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Google signup failed. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    // Sends registration details to the backend
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/register', {
                name: data.name,
                phone: data.phone,
                email: data.email,
                password: data.password
            })

            if (response.data.success) {
                navigate('/verify-otp', {
                    replace: true,
                    state: {
                        email: data.email
                    }
                })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Registration failed. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthLayout>
            <div className="signup-form">
                <h1>YUMERA</h1>
                <p>The Essence of You.</p>

                <h2>Create Your Account</h2>
                <p>Join YUMERA and discover the world of premium fragrances.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Full Name</label>
                    <input
                        maxLength={50}
                        {...register('name', {
                            required: 'Name is required',
                            validate: value => {
                                const trimmed = value.trim()
                                if (!trimmed) return 'Name cannot be empty'
                                if (trimmed.length < 2) return 'Name must be at least 2 characters'
                                if (trimmed.length > 50) return 'Name cannot exceed 50 characters'
                                if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'Name should contain only letters'
                                return true
                            }
                        })}
                        placeholder="Enter your full name"
                    />
                    <p className="error-message">{errors.name?.message}</p>

                    <label>Phone Number</label>
                    <input
                        type="tel"
                        maxLength={10}
                        onKeyDown={(e) => {
                            // Only allow digits, Backspace, Delete, Tab, Arrow keys
                            if (
                                !/[0-9]/.test(e.key) &&
                                !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                            ) {
                                e.preventDefault()
                            }
                        }}
                        {...register('phone', {
                            required: 'Phone number is required',
                            validate: value => {
                                const trimmed = value.trim()
                                if (!/^[6-9]\d{9}$/.test(trimmed)) {
                                    return 'Enter a valid 10-digit Indian phone number (starting with 6-9)'
                                }
                                return true
                            }
                        })}
                        placeholder="Enter your 10-digit phone number"
                    />
                    <p className="error-message">{errors.phone?.message}</p>

                    <label>Email Address</label>
                    <input
                        type="email"
                        {...register('email', {
                            required: 'Email is required',
                            validate: value => {
                                const trimmed = value.trim()
                                if (!/^[a-zA-Z]/.test(trimmed)) {
                                    return 'Email must start with a letter'
                                }
                                if (!/^[a-zA-Z][a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
                                    return 'Email must have at least 5 characters before @ and be a valid format'
                                }
                                return true
                            }
                        })}
                        placeholder="Enter your email address"
                    />
                    <p className="error-message">{errors.email?.message}</p>

                    <label>Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            maxLength={30}
                            {...register('password', {
                                required: 'Password is required',
                                validate: value => {
                                    if (value.length < 8) return 'Password must contain at least 8 characters'
                                    if (value.length > 30) return 'Password cannot exceed 30 characters'
                                    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
                                    if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
                                    if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special symbol'
                                    return true
                                }
                            })}
                            placeholder="Create a password (8-30 characters)"
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

                    <label>Confirm Password</label>
                    <div className="password-input-wrapper">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            maxLength={30}
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: value =>
                                    value === getValues('password') || 'Passwords do not match'
                            })}
                            placeholder="Confirm your password"
                        />
                        <button
                            type="button"
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                            {showConfirmPassword ? (
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
                    <p className="error-message">{errors.confirmPassword?.message}</p>

                    <label>
                        <input
                            type="checkbox"
                            {...register('terms', {
                                required: 'Please accept the terms'
                            })}
                        />
                        I agree to the Terms of Service and Privacy Policy
                    </label>
                    <p className="error-message">{errors.terms?.message}</p>
                    {/* Displays backend registration errors */}
                    {serverError && (
                        <p className="error-message">{serverError}</p>
                    )}

                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT →'}
                    </button>

                    {/* Google Sign-In */}
                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => {
                                setServerError('Google signup failed. Please try again.')
                            }}
                            text="continue_with"
                            theme="outline"
                            size="large"
                            shape="rectangular"
                            width="380"
                        />
                    </div>

                    <p className="auth-signin">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>

                </form>
            </div>
        </AuthLayout>
    )
}

export default SignupPage