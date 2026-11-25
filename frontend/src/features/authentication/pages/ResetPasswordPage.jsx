import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import api from '../../../services/api'
import './SignupPage.css'

//----------------------------------------------------------
// Reset password page

function ResetPasswordPage() {
    const navigate = useNavigate()
    //Get verified email 
    const location = useLocation()
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm()

    // Sends the new password to the backend
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/reset-password', {
                email: location.state?.email,
                newPassword: data.password
            })

            if (response.data.success) {
                navigate('/login', { replace: true })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to reset password. Please try again.'
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

                <h2>Reset Password</h2>
                <p>Create a new password for your account.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>New Password</label>

                    <input
                        type="password"
                        placeholder="Enter new password"
                        {...register('password', {
                            required: 'Password is required',
                            validate: value =>
                                (
                                    value.length >= 8 &&
                                    /[A-Z]/.test(value) &&
                                    /[0-9]/.test(value) &&
                                    /[^A-Za-z0-9]/.test(value)
                                ) || 'Password must contain at least 8 characters, one uppercase letter, one number and one special symbol'
                        })}
                    />

                    <p className="error-message">{errors.password?.message}</p>

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        placeholder="Confirm new password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value =>
                                value === getValues('password') || 'Passwords do not match'
                        })}
                    />

                    <p className="error-message">{errors.confirmPassword?.message}</p>

                    {/* Displays password reset errors from the backend */}
                    {serverError && (
                        <p className="error-message">{serverError}</p>
                    )}

                    {/* Disables submission while the password reset request is processing */}
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'RESETTING...' : 'RESET PASSWORD →'}
                    </button>
                </form>

                <p className="auth-signin">
                    <Link to="/login">← Back to Login</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default ResetPasswordPage
