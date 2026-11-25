import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { adminLogout } from '../features/authentication/authSlice'
import api from '../services/api'
import './AdminLayout.css'

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { label: 'Products', path: '/admin/products', icon: '🛍️' },
    { label: 'Categories', path: '/admin/categories', icon: '🏷️' },
    { label: 'Orders', path: '/admin/orders', icon: '📦' },
    { label: 'Users', path: '/admin/users', icon: '👥' },
    { label: 'Coupons & Offers', path: '/admin/coupons', icon: '🎟️' },
    { label: 'Sales & Reports', path: '/admin/reports', icon: '📈' }
]

function AdminLayout({ children }) {
    const location = useLocation()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleLogout = async () => {
        try {
            await api.post('/admin/logout')
        } catch (error) {
            console.error('Admin logout failed:', error)
        } finally {
            dispatch(adminLogout())
            navigate('/admin/login', { replace: true })
        }
    }

    return (
        <div className="admin-layout">
            {/* Left Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <h2>YUMERA</h2>
                    <span>ADMIN PANEL</span>
                </div>

                <nav className="admin-sidebar-nav">
                    {NAV_ITEMS.map((item) => {
                        const isActive = location.pathname.startsWith(item.path)
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span className="nav-label">{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                <div className="admin-sidebar-footer">
                    <button
                        type="button"
                        className="admin-logout-btn"
                        onClick={handleLogout}
                    >
                        <span className="nav-icon">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Right Main Content Area */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    )
}

export default AdminLayout