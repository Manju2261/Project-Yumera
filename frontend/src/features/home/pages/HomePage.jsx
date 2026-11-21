// Temporary home page for frontend navigation testing
import { Link } from 'react-router-dom'

// Home page component
function HomePage() {
    return (
        <main>
            <h1>YUMERA</h1>
            <p>The Essence of You</p>

            <nav>
                <Link to="/signup">Sign Up</Link>
                <Link to="/login">Login</Link>
                <Link to="/profile">Profile</Link>
            </nav>
        </main>
    )
}

export default HomePage