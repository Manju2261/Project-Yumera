import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './HomePage.css'

function HomePage() {
    const { isAuthenticated, user } = useSelector((state) => state.auth)

    return (
        <div className="home-container">
            {/* 1. Navbar */}
            <header className="navbar">
                <Link to="/" className="navbar-logo">
                    <span className="logo-name">YUMERA</span>
                    <span className="logo-tagline">The Essence of You.</span>
                </Link>

                <nav>
                    <ul className="navbar-links">
                        <li><Link to="/" className="active">HOME</Link></li>
                        <li><Link to="/#men">MEN</Link></li>
                        <li><Link to="/#women">WOMEN</Link></li>
                        <li><Link to="/#about">ABOUT US</Link></li>
                    </ul>
                </nav>

                <div className="navbar-icons">
                    {/* Wishlist icon */}
                    <button type="button" aria-label="Wishlist">
                        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                    </button>

                    {/* Cart bag icon */}
                    <button type="button" aria-label="Cart">
                        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
                        </svg>
                    </button>

                    {/* Displays profile image */}
                    <Link
                        to={isAuthenticated ? "/profile" : "/login"}
                        aria-label="Account"
                        className="navbar-profile-link"
                    >
                        {isAuthenticated ? (
                            user?.profileImageUrl ? (
                                <img
                                    src={user.profileImageUrl}
                                    alt="Profile"
                                    className="navbar-profile-image"
                                />
                            ) : (
                                <span className="navbar-profile-initial">
                                    {user?.name?.charAt(0)?.toUpperCase()}
                                </span>
                            )
                        ) : (
                            <svg
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                viewBox="0 0 24 24"
                                style={{ width: '20px', height: '20px', color: '#102A43', pointerEvents: 'none' }}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                                />
                            </svg>
                        )}
                    </Link>
                </div>
            </header>

            {/* Hero Section*/}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-tagline-wrapper">
                        <span className="hero-tagline">DISCOVER YOUR SIGNATURE SCENT</span>
                        <span className="hero-tagline-line"></span>
                    </div>

                    <h1 className="hero-heading">
                        A Fragrance<br />
                        That Feels Like You.
                    </h1>

                    <p className="hero-description">
                        Express your individuality<br />
                        through a scent that stays with you.
                    </p>

                    <div className="hero-cta-group">
                        <Link to={isAuthenticated ? "/#shop" : "/signup"} className="hero-primary-btn">
                            EXPLORE COLLECTION →
                        </Link>
                    </div>
                </div>
            </section>

            {/* 3. Dummy Body (WEEK-1)  */}
            <main style={{ padding: '80px 20px', textAlign: 'center', background: '#DCEAF7' }}>
                <p style={{ fontSize: '18px', color: '#102A43', letterSpacing: '2px', margin: 0, fontWeight: 600 }}>
                    Loading...
                </p>
            </main>
        </div>
    )
}

export default HomePage