import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api from '../../../services/api'
import { setCredentials } from '../../authentication/authSlice'
import ProfileLayout from '../components/ProfileLayout'
import './ProfilePage.css'

// User profile page
function ProfilePage() {
    const dispatch = useDispatch()
    const user = useSelector(state => state.auth.user)

    const [isLoading, setIsLoading] = useState(true)
    const [serverError, setServerError] = useState('')

    // Fetches the logged-in user's profile from the backend
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/user/profile')

                if (response.data.success) {
                    dispatch(setCredentials(response.data.user))
                }
            } catch (error) {
                setServerError(
                    error.response?.data?.message ||
                    'Unable to load profile. Please try again.'
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [dispatch])

    // Selects the default address or the first saved address
    const defaultAddress = user?.addresses?.find(item => item.isDefault)
        || user?.addresses?.[0]

    return (
        <ProfileLayout
            title="My Profile"
            subtitle="View and manage your personal details and preferences"
        >
            <div className="profile-card-section">
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                {isLoading ? (
                    <p className="profile-loading-text">Loading profile...</p>
                ) : (
                    <>
                        {/* Section Header */}
                        <div className="profile-card-header">
                            <h2>Personal Information</h2>
                            <Link to="/profile/edit" className="profile-edit-btn">
                                Edit Details ✏️
                            </Link>
                        </div>

                        {/* User Details Grid */}
                        <div className="profile-info-grid">
                            <div className="info-item">
                                <span className="info-label">Full Name</span>
                                <p className="info-value">{user?.name || '—'}</p>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Email Address</span>
                                <p className="info-value">{user?.email || '—'}</p>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Phone Number</span>
                                <p className="info-value">{user?.phone || 'Not provided'}</p>
                            </div>

                            <div className="info-item">
                                <span className="info-label">Account Type</span>
                                <p className="info-value">
                                    {user?.authProvider === 'google' ? 'Google Account' : 'Standard Email/Password'}
                                </p>
                            </div>
                        </div>

                        {/* Default Shipping Address Section */}
                        <div className="profile-address-box">
                            <h3>
                                <span>Default Delivery Address</span>
                                <span className="badge-pill">Primary</span>
                            </h3>

                            {defaultAddress ? (
                                <>
                                    <p><strong>{defaultAddress.fullName}</strong> ({defaultAddress.phone})</p>
                                    <p>{defaultAddress.addressLine}</p>
                                    <p>{defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}</p>
                                    <Link to="/addresses" className="manage-addr-link">
                                        Manage All Addresses →
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p>No delivery address saved yet.</p>
                                    <Link to="/address/add" className="manage-addr-link">
                                        + Add New Address
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Google Account Note */}
                        {user?.authProvider === 'google' && (
                            <div className="profile-security-notice">
                                ℹ️ Your account is signed in with Google. Email and password changes are securely managed through your Google Account.
                            </div>
                        )}
                    </>
                )}
            </div>
        </ProfileLayout>
    )
}

export default ProfilePage