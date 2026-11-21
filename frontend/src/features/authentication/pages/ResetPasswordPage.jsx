
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'

//----------------------------------------------------------
// Reset password page

function ResetPasswordPage() 
{
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm()

    const password = watch('password')

    // Navigate to Login after password validation
    const onSubmit = () => {
        navigate('/login', { replace: true })
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
                            minLength: {
                                value: 8,
                                message: 'Minimum 8 characters required'
                            }
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
                                value === password || 'Passwords do not match'
                        })}
                    />

                    <p className="error-message">{errors.confirmPassword?.message}</p>

                    <button type="submit">RESET PASSWORD</button>
                </form>

                <p>
                    <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default ResetPasswordPage
