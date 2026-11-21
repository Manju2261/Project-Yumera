
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

//------------------------------------------------------
// Login page

function LoginPage() 
{
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    // Navigate to Home after dummy login
    const onSubmit = () => {
        navigate('/')
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
                    <p className="error-message">{errors.password?.message}</p>

                    <p>
                        <Link to="/forgot-password">Forgot Password?</Link>
                    </p>

                    <button type="submit">LOGIN</button>
                </form>

                {/* Google Sign-In */}
                <div className="auth-divider">
                    <span>OR</span>
                </div>

                <button type="button" className="google-button">
                    <span>G</span>
                    Continue with Google
                </button>

                <p>
                    Don't have an account? <Link to="/signup">Sign Up</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default LoginPage
