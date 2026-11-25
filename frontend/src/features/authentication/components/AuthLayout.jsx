import { Link } from 'react-router-dom'
import "./AuthLayout.css"

// Shared layout for all authentication pages
function AuthLayout({ children }) {
    return (
        <div className="auth-container">
            {/* Backward arrow to go to Home Page */}
            <Link to="/" className="auth-back-btn" aria-label="Back to Home">
                ←
            </Link>

            <section className="auth-image">
                <p>HAUTE PARFUMERIE</p>
                <h1>A fresh start for your YUMERA journey.</h1>
                <p>THE ESSENCE OF YOU</p>
            </section>

            <section className="auth-content">
                {children}
            </section>
        </div>
    )
}

export default AuthLayout