import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import api from '../../../services/api'
import './SignupPage.css'

//--------------------------------------------------------
// Forgot password page

function ForgotPasswordPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const email = location.state?.email
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    const [serverError, setServerError] = useState("")
    const [isloading, setIsLoading] = useState(false)

    // Sends the password reset OTP to the email address.
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/forgot-password', {
                email: data.email
            })

            if (response.data.success) {
                navigate('/verify-otp', {
                    replace: true,
                    state: {
                        from: 'forgot-password',
                        email: data.email
                    }
                })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to process your request. Please try again.'
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

                <h2>Forgot Password?</h2>
                <p>We will send a password reset OTP to your registered email address.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Registered Email Address</label>
                    <input
                        type="email"
                        placeholder="Enter your registered email"
                        defaultValue={email || ''}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address'
                            }
                        })}
                    />
                    <p className="error-message">{errors.email?.message}</p>

                    {serverError && (
                        <p className="error-message">{serverError}</p>
                    )}

                    <button type="submit" disabled={isloading}>
                        {isloading ? 'SENDING...' : 'SEND OTP →'}
                    </button>
                </form>

                <p className="auth-signin">
                    <Link to="/login">← Back to Login</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default ForgotPasswordPage
