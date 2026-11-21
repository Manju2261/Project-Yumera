import { Link, useNavigate, useLocation } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import OTPVerification from '../../../components/common/OTPVerification'

// OTP verification page using the reusable component
function VerifyOTPPage() {
    const navigate = useNavigate()
    const location = useLocation()

    // Navigate after OTP verification
    const handleVerify = () => {
        if (location.state?.from === 'forgot-password') {
            navigate('/reset-password', { replace: true })
        } else if (location.state?.from === 'change-email') {
            navigate('/profile')
        } else {
            navigate('/login', { replace: true })
        }
    }

    // Handle OTP resend
    const handleResend = () => {}

    return (
        <AuthLayout>
            <div className="signup-form">
                <h1>YUMERA</h1>
                <p>The Essence of You.</p>

                <h2>Verify Your Email</h2>
                <p>Enter the 6-digit OTP sent to your email address.</p>

                <OTPVerification
                    onVerify={handleVerify}
                    onResend={handleResend}
                />

                <p>
                    <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default VerifyOTPPage