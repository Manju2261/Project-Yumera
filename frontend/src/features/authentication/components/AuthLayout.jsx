import { Link } from 'react-router-dom'
import "./AuthLayout.css"

// Shared layout for all authentication pages
function AuthLayout({ children, isAdmin = false, tagline, title, subtext }) {
    return (
        <div className={`auth-container ${isAdmin ? 'admin-auth-container' : ''}`}>
            <Link to="/" className="auth-back-btn" aria-label="Back to Home">
                ←
            </Link>

            <section className={`auth-image ${isAdmin ? 'admin-auth-image' : ''}`}>
                <p>{tagline || 'HAUTE PARFUMERIE'}</p>
                <h1>{title || 'A fresh start for your YUMERA journey.'}</h1>
                <p>{subtext || 'THE ESSENCE OF YOU'}</p>
            </section>

            <section className="auth-content">
                {children}
            </section>
        </div>
    )
}

export default AuthLayout