import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setCredentials } from '../authSlice'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import OTPVerification from '../../../components/common/OTPVerification'
import api from '../../../services/api'
import './SignupPage.css'

//-----------------------------------------------------------------------
// OTP verification page using the reusable component

function VerifyOTPPage() {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const navigate = useNavigate()
    const location = useLocation()

    //Stores OTP verification status and backend error
    const [serverError, setServerError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    //-----------------------------------------------------------------
    // Verifies OTP based on the current authentication flow

    const handleVerify = async (otp) => {
        try {
            setServerError('')
            setIsLoading(true)

            let response

            if (location.state?.from === 'forgot-password') {
                response = await api.post('/auth/verify-reset-otp', {
                    email: location.state?.email,
                    otp
                })
            } else if (location.state?.from === 'change-email-current') {
                response = await api.post('/auth/change-email/verify-current', {
                    otp
                })
            } else if (location.state?.from === 'change-email-new') {
                response = await api.post('/auth/change-email/verify-new', {
                    otp
                })
            } else {
                response = await api.post('/auth/verify-otp', {
                    email: location.state?.email,
                    otp
                })
            }

            if (response.data.success) {
                if (location.state?.from === 'forgot-password') {
                    navigate('/reset-password', {
                        replace: true,
                        state: { email: location.state.email }
                    })
                } else if (location.state?.from === 'change-email-current') {
                    // Current email verified! Redirect back to Change Email Page to enter NEW email
                    sessionStorage.removeItem('yumera_otp_expiry')
                    navigate('/profile/change-email', {
                        replace: true,
                        state: { currentEmailVerified: true }
                    })
                } else if (location.state?.from === 'change-email-new') {
                    // New email verified! Email successfully changed
                    sessionStorage.removeItem('yumera_otp_expiry')
                    dispatch(setCredentials({
                        ...user,
                        ...response.data.user
                    }))
                    navigate('/profile', { replace: true })
                } else {
                    navigate('/login', { replace: true })
                }
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'OTP verification failed. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    //---------------------------------------------------------------------------
    // Resends OTP based on the current authentication flow

    const handleResend = async () => {
        try {
            setServerError('')

            if (location.state?.from === 'forgot-password') {
                await api.post('/auth/forgot-password', {
                    email: location.state?.email
                })
            } else if (location.state?.from === 'change-email') {
                // Requests a new OTP for the same email address.
                await api.post('/auth/change-email/request', {
                    newEmail: location.state?.email
                })
            } else {
                await api.post('/auth/resend-otp', {
                    email: location.state?.email
                })
            }

            return true
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to resend OTP. Please try again.'
            )

            return false
        }
    }

    return (
        <AuthLayout>
            <div className="signup-form">
                <h1>YUMERA</h1>
                <p>The Essence of You.</p>

                <h2>
                    {location.state?.isNewEmailStep
                        ? 'Step 2: Confirm New Email'
                        : 'Verify Your Email'}
                </h2>
                <p>
                    {location.state?.isNewEmailStep
                        ? 'Current email verified! Now enter the 6-digit OTP sent to your new email: '
                        : 'Enter the 6-digit OTP sent to '}
                    <strong>{location.state?.email || 'your email address'}</strong>.
                </p>

                <OTPVerification
                    onVerify={handleVerify}
                    onResend={handleResend}
                    isLoading={isLoading}
                    serverError={serverError}
                />

                <p className="auth-signin">
                    <Link to="/login">← Back to Login</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default VerifyOTPPage