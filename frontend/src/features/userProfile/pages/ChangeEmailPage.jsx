import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import './ProfilePage.css'

// Change email page
function ChangeEmailPage() {
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    // Navigate to shared OTP verification page after email validation
    const onSubmit = () => {
        navigate('/verify-otp', {
            state: { from: 'change-email' }
        })
    }

    return (
        <div className="profile-page">
            <h1>Change Email Address</h1>

            <div className="profile-details">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>New Email Address</label>

                    <input
                        type="email"
                        placeholder="Enter your new email"
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Enter a valid email address'
                            }
                        })}
                    />

                    <p className="error-message">
                        {errors.email?.message}
                    </p>

                    <button type="submit">SEND OTP</button>
                </form>

                <p>
                    <Link to="/profile">Cancel</Link>
                </p>
            </div>
        </div>
    )
}

export default ChangeEmailPage