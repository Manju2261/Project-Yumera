
import { useForm } from 'react-hook-form'
import AuthLayout from '../components/AuthLayout'
import "./SignupPage.css"
import { Link, useNavigate } from 'react-router-dom'

//----------------------------------------------------
// Signup page

function SignupPage() 
{
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm()

    const password = watch('password')
    // Navigate to OTP verification after successful validation
    const onSubmit = () => {
        navigate('/verify-otp', { replace: true })
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
                        {...register('name', {
                            required: 'Name is required',
                            validate: value => value.trim() !== '' || 'Name cannot be empty'
                        })}
                        placeholder="Enter your full name"
                    />
                    <p className="error-message">{errors.name?.message}</p>

                    <label>Phone Number</label>
                    <input
                        {...register('phone', { required: 'Phone number is required' })}
                        placeholder="Enter your phone number"
                    />
                    <p className="error-message">{errors.phone?.message}</p>

                    <label>Email Address</label>
                    <input
                        type="email"
                        {...register('email', { required: 'Email is required' })}
                        placeholder="Enter your email address"
                    />
                    <p className="error-message">{errors.email?.message}</p>

                    <label>Password</label>
                    <input
                        type="password"
                        {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Minimum 8 characters required'
                        }
                        })}
                        placeholder="Create a password"
                    />
                    <p className="error-message">{errors.password?.message}</p>

                    <label>Confirm Password</label>
                    <input
                        type="password"
                        {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value =>
                            value === password || 'Passwords do not match'
                        })}
                        placeholder="Confirm your password"
                    />
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

                    <button type="submit">CREATE ACCOUNT →</button>
                
                    {/* Google Sign-In */}
                    <div className="auth-divider">
                        <span>OR</span>
                    </div>

                    <button type="button" className="google-button">
                        <span>G</span>
                        Continue with Google
                    </button>
                    <p className="auth-signin">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                                    
                </form>
            </div>
        </AuthLayout>
    )
}

export default SignupPage