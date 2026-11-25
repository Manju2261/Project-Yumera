import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../../services/api'
import ProfileLayout from '../components/ProfileLayout'
import './ProfilePage.css'

// Change email page
function ChangeEmailPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const user = useSelector((state) => state.auth.user)
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    // Checks if current email has already been verified
    const isCurrentEmailVerified = location.state?.currentEmailVerified === true

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        mode: 'onTouched'
    })

    // Step 1: Send OTP to Current Email
    const handleSendCurrentOTP = async () => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/change-email/request-current')

            if (response.data.success) {
                sessionStorage.removeItem('yumera_otp_expiry')
                navigate('/verify-otp', {
                    replace: true,
                    state: {
                        from: 'change-email-current',
                        email: user?.email
                    }
                })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to send OTP. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Send OTP to New Email (after current email verified)
    const onSubmitNewEmail = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/auth/change-email/request-new', {
                newEmail: data.email
            })

            if (response.data.success) {
                sessionStorage.removeItem('yumera_otp_expiry')
                navigate('/verify-otp', {
                    replace: true,
                    state: {
                        from: 'change-email-new',
                        email: data.email
                    }
                })
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to send OTP to new email. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    if (user?.authProvider === 'google') {
        return (
            <ProfileLayout
                title="Change Email Address"
                subtitle="Manage your account contact information"
            >
                <div className="profile-security-notice" style={{ marginTop: 0 }}>
                    ℹ️ Your account is signed in with Google. Email address cannot be changed through YUMERA. Please manage your email directly through your Google Account.
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
            title="Change Email Address"
            subtitle={
                isCurrentEmailVerified
                    ? 'Step 2: Enter your new email address'
                    : 'Step 1: Verify your current email address first'
            }
        >
            <div className="edit-profile-card">
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                {!isCurrentEmailVerified ? (
                    /* STEP 1: Verify Current Email */
                    <div className="edit-profile-form">
                        <div className="edit-form-field">
                            <label>Current Email Address</label>
                            <input
                                type="text"
                                value={user?.email || ''}
                                disabled
                                style={{ background: '#f8fafc', color: '#64748b', cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="profile-security-notice" style={{ marginTop: '4px' }}>
                            🔒 <strong>Security Verification:</strong> Before entering a new email, we must verify that you are the owner of this account. Click below to receive a verification OTP on your current email.
                        </div>

                        <div className="edit-form-actions">
                            <button
                                type="button"
                                className="profile-save-btn"
                                onClick={handleSendCurrentOTP}
                                disabled={isLoading}
                            >
                                {isLoading ? 'SENDING OTP...' : 'SEND OTP TO CURRENT EMAIL →'}
                            </button>

                            <Link to="/profile" className="profile-cancel-btn">
                                Cancel
                            </Link>
                        </div>
                    </div>
                ) : (
                    /* STEP 2: Enter New Email */
                    <form onSubmit={handleSubmit(onSubmitNewEmail)} className="edit-profile-form">
                        <div className="edit-form-field">
                            <label>New Email Address</label>
                            <input
                                type="email"
                                placeholder="Enter your new email address"
                                {...register('email', {
                                    required: 'New email is required',
                                    validate: value => {
                                        const trimmed = value.trim()
                                        if (!trimmed) return 'New email is required'
                                        if (trimmed.toLowerCase() === user?.email?.toLowerCase()) {
                                            return 'New email must be different from current email'
                                        }
                                        if (!/^[a-zA-Z]/.test(trimmed)) {
                                            return 'Email must start with a letter'
                                        }
                                        if (!/^[a-zA-Z][a-zA-Z0-9._%+-]{4,}@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
                                            return 'Email must have at least 5 characters before @ and be a valid format'
                                        }
                                        return true
                                    }
                                })}
                            />
                            <p className="error-message">{errors.email?.message}</p>
                        </div>

                        <div className="profile-security-notice" style={{ marginTop: '4px' }}>
                            ✉️ We will send a final verification OTP to this new email address to complete the change.
                        </div>

                        <div className="edit-form-actions">
                            <button type="submit" className="profile-save-btn" disabled={isLoading}>
                                {isLoading ? 'SENDING OTP...' : 'VERIFY NEW EMAIL →'}
                            </button>

                            <Link to="/profile" className="profile-cancel-btn">
                                Cancel
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </ProfileLayout>
    )
}

export default ChangeEmailPage