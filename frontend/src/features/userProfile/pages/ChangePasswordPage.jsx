import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../services/api'
import ProfileLayout from '../components/ProfileLayout'
import './ProfilePage.css'

// Change password page
function ChangePasswordPage() {
    const navigate = useNavigate()
    const user = useSelector((state) => state.auth.user)
    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors }
    } = useForm({
        mode: 'onTouched'
    })

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Sends the current and new passwords to the backend
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.patch('/auth/change-password', {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword
            })

            if (response.data.success) {
                navigate('/profile', { replace: true })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to update password. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    if (user?.authProvider === 'google') {
        return (
            <ProfileLayout
                title="Change Password"
                subtitle="Manage your account security settings"
            >
                <div className="profile-security-notice" style={{ marginTop: 0 }}>
                    ℹ️ Your account is signed in with Google. Passwords cannot be changed through YUMERA. Please manage your security settings directly through your Google Account.
                </div>
                <div style={{ marginTop: '20px' }}>
                    <Link to="/profile" className="profile-cancel-btn">
                        ← Back to Profile
                    </Link>
                </div>
            </ProfileLayout>
        )
    }

    return (
        <ProfileLayout
            title="Change Password"
            subtitle="Choose a strong password with at least 8 characters"
        >
            <div className="edit-profile-card">
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="edit-profile-form">
                    <div className="edit-form-field">
                        <label>Current Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showCurrentPassword ? 'text' : 'password'}
                                maxLength={30}
                                placeholder="Enter current password"
                                {...register('currentPassword', {
                                    required: 'Current password is required'
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                            >
                                {showCurrentPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="error-message">{errors.currentPassword?.message}</p>
                    </div>

                    <div className="edit-form-field">
                        <label>New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                maxLength={30}
                                placeholder="Create new password (8-30 characters)"
                                {...register('newPassword', {
                                    required: 'New password is required',
                                    validate: value => {
                                        if (value.length < 8) return 'Password must contain at least 8 characters'
                                        if (value.length > 30) return 'Password cannot exceed 30 characters'
                                        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter'
                                        if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
                                        if (!/[^A-Za-z0-9]/.test(value)) return 'Password must contain at least one special symbol'
                                        if (value === getValues('currentPassword')) return 'New password must be different from current password'
                                        return true
                                    }
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                                {showNewPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="error-message">{errors.newPassword?.message}</p>
                    </div>

                    <div className="edit-form-field">
                        <label>Confirm New Password</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                maxLength={30}
                                placeholder="Confirm new password"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: value =>
                                        value === getValues('newPassword') || 'Passwords do not match'
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle-btn"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                                {showConfirmPassword ? (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        <p className="error-message">{errors.confirmPassword?.message}</p>
                    </div>

                    <div className="edit-form-actions">
                        <button type="submit" className="profile-save-btn" disabled={isLoading}>
                            {isLoading ? 'UPDATING...' : 'UPDATE PASSWORD →'}
                        </button>

                        <Link to="/profile" className="profile-cancel-btn">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    )
}

export default ChangePasswordPage