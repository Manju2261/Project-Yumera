
import { useForm } from 'react-hook-form'
import { Link, useNavigate} from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

//--------------------------------------------------------
// Forgot password page

function ForgotPasswordPage() 
{
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    // Navigate to OTP verification after email validation
    const onSubmit = () => {
        navigate('/verify-otp', {
            state: { from: 'forgot-password' },
            replace: true
        })
    }

    return (
        <AuthLayout>
            <div className="signup-form">
                <h1>YUMERA</h1>
                <p>The Essence of You.</p>

                <h2>Forgot Password?</h2>
                <p>Enter your registered email address to reset your password.</p>

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

                    <button type="submit">SEND OTP</button>
                </form>

                <p>
                    <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default ForgotPasswordPage
