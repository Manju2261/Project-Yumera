import { Link } from 'react-router-dom'
import ProfileSidebar from './ProfileSidebar'
import './ProfileLayout.css'

function ProfileLayout({ children, title, subtitle }) {
    return (
        <div className="profile-layout-container">
            {/* Top Navigation / Breadcrumb */}
            <div className="profile-top-header">
                <Link to="/" className="profile-back-link">
                    ← Back to Shop
                </Link>
                {title && <h1 className="profile-main-title">{title}</h1>}
                {subtitle && <p className="profile-main-subtitle">{subtitle}</p>}
            </div>

            {/* Two-Column Master Layout */}
            <div className="profile-layout-grid">
                <aside className="profile-layout-sidebar">
                    <ProfileSidebar />
                </aside>

                <main className="profile-layout-content">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default ProfileLayout