import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../authentication/authSlice'
import api from '../../../services/api'
import './ProfileLayout.css'

function ProfileSidebar() {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector(state => state.auth.user)

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout')
        } catch (error) {
            console.error('User logout failed:', error)
        } finally {
            dispatch(logout())
            navigate('/login')
        }
    }

    const isGoogleUser = user?.authProvider === 'google'

    return (
        <div className="profile-sidebar-card">
            {/* User Profile Mini Header */}
            <div className="sidebar-user-info">
                <div className="sidebar-avatar">
                    {user?.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt="Profile" />
                    ) : (
                        <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                </div>
                <h3 className="sidebar-user-name">{user?.name || 'Customer'}</h3>
                <p className="sidebar-user-email">{user?.email}</p>
            </div>

            {/* Navigation Links */}
            <nav className="sidebar-nav-menu">
                <Link
                    to="/profile"
                    className={`sidebar-nav-item ${location.pathname === '/profile' || location.pathname === '/profile/edit' ? 'active' : ''}`}
                >
                    <span className="sidebar-nav-icon">👤</span>
                    <span>My Profile</span>
                </Link>

                <Link
                    to="/addresses"
                    className={`sidebar-nav-item ${location.pathname.startsWith('/address') ? 'active' : ''}`}
                >
                    <span className="sidebar-nav-icon">📍</span>
                    <span>My Addresses</span>
                </Link>

                {!isGoogleUser && (
                    <>
                        <Link
                            to="/profile/change-password"
                            className={`sidebar-nav-item ${location.pathname === '/profile/change-password' ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">🔒</span>
                            <span>Change Password</span>
                        </Link>

                        <Link
                            to="/profile/change-email"
                            className={`sidebar-nav-item ${location.pathname === '/profile/change-email' ? 'active' : ''}`}
                        >
                            <span className="sidebar-nav-icon">✉️</span>
                            <span>Change Email</span>
                        </Link>
                    </>
                )}
            </nav>

            {/* Logout Button */}
            <div className="sidebar-footer">
                <button
                    type="button"
                    className="sidebar-logout-btn"
                    onClick={handleLogout}
                >
                    <span className="sidebar-nav-icon">🚪</span>
                    <span>Logout</span>
                </button>
            </div>
        </div>
    )
}

export default ProfileSidebar