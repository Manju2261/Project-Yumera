
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../authentication/components/AuthLayout'

//----------------------------------------------------------
// Admin login page
function AdminLoginPage() 
{
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    // Navigate to admin users page after form validation
    const onSubmit = () => {
        navigate('/admin/users')
    }

    return (
        <AuthLayout>
            <div className="signup-form">
                <h1>YUMERA</h1>
                <p>The Essence of You.</p>

                <h2>Admin Sign In</h2>
                <p>Login to your admin account.</p>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Email Address</label>
                    <input
                    type="email"
                    placeholder="Enter admin email"
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

                    <button type="submit">ADMIN LOGIN</button>
                </form>

                <p>
                    <Link to="/">Back to Home</Link>
                </p>
            </div>
        </AuthLayout>
    )
}

export default AdminLoginPage
