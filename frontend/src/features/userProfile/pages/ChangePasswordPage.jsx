
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import './ProfilePage.css'

//--------------------------------------------------------
// Change password page

function ChangePasswordPage() 
{
    const navigate = useNavigate()
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm()

    const newPassword = watch('newPassword')
    // Handle password update and return to profile page
    const onSubmit = () => {
        navigate('/profile')
    }

    return (
        <div className="profile-page">
            <h1>Change Password</h1>

            <div className="profile-details change-password-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Current Password</label>
                    <input
                        type="password"
                        placeholder="Enter current password"
                        {...register('currentPassword', {
                            required: 'Current password is required'
                        })}
                    />
                    <p className="error-message">{errors.currentPassword?.message}</p>

                    <label>New Password</label>
                    <input
                        type="password"
                        placeholder="Enter new password"
                        {...register('newPassword', {
                            required: 'New password is required',
                            minLength: {
                                value: 8,
                                message: 'Minimum 8 characters required'
                            }
                        })}
                    />
                    <p className="error-message">{errors.newPassword?.message}</p>

                    <label>Confirm New Password</label>
                    <input
                        type="password"
                        placeholder="Confirm new password"
                        {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value =>
                                value === newPassword || 'Passwords do not match'
                        })}
                    />
                    <p className="error-message">{errors.confirmPassword?.message}</p>

                    <button type="submit">UPDATE PASSWORD</button>
                </form>

                <p>
                    <Link to="/profile">Cancel</Link>
                </p>
            </div>
        </div>
    )
}

export default ChangePasswordPage
