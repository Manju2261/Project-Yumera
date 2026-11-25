import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { GoogleLogin } from '@react-oauth/google'
import AuthLayout from '../components/AuthLayout'
import { setCredentials } from '../authSlice'
import api from '../../../services/api'
import './SignupPage.css'

//------------------------------------------------------
// Login page

function LoginPage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm()

    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Sends login credentials to the backend
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/login', {
                email: data.email,
                password: data.password
            })

            if (response.data.success) {
                // Stores the logged-in user's details in Redux
                dispatch(setCredentials(response.data.user))

                navigate('/', { replace: true })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Login failed. Please check your credentials and try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    // Sends the Google ID token to the backend for authentication.
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            console.log('Google login success from Google:', credentialResponse)
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/google-login', {
                idToken: credentialResponse.credential
            })

            console.log('Backend response:', response.data)

            if (response.data.success) {
                dispatch(setCredentials(response.data.user))
                navigate('/', { replace: true })
            }
        } catch (error) {
            console.error('Google login backend error:', error)
            setServerError(
                error.response?.data?.message ||
                'Google login failed. Please try again.'
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

                <h2>Welcome Back</h2>
                <p>Login to your YUMERA account.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address'
                            }
                        })}
                    />
                    <p className="error-message">{errors.email?.message}</p>

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        {...register('password', {
                            required: 'Password is required'
                        })}
                    />
                    <div className="forgot-password-wrapper">
                        <Link
                            to="/forgot-password"
                            state={{ email: getValues('email') }}
                            className="forgot-password-link"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Displays login errors returned by the backend or Google */}
                    {serverError && (
                        <p className="error-message">{serverError}</p>
                    )}

                    {/* Disables login while the backend request is processing */}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'LOGGING IN...' : 'LOGIN →'}
                    </button>

                    {/* Google Sign-In */}
                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <div className="google-login-wrapper">
                        <GoogleLogin
                            onSuccess={handleGoogleLogin}
                            onError={() => {
                                console.error('Google popup closed or failed')
                                setServerError('Google login failed. Please try again.')
                            }}
                        />
                    </div>

                    <p className="auth-signin">
                        Don't have an account? <Link to="/signup">Sign Up</Link>
                    </p>
                </form>
            </div>
        </AuthLayout>
    )
}

export default LoginPage
