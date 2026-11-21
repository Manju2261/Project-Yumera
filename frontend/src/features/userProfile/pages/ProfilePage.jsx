
import { Link } from 'react-router-dom'
import "./ProfilePage.css"

//-------------------------------------------------------
// User profile page

function ProfilePage() 
{
    // Temporary user details
    const user = {
        name: 'Manju K M',
        email: 'manju@example.com',
        phone: '9876543210',
        address: 'Koyilandy, Kerala'
    }

    return (
        <div className="profile-page">
            <h1>My Profile</h1>

            <div className="profile-details">
                <div className="profile-image">
                    <span>{user.name.charAt(0)}</span>
                </div>

                <h2>{user.name}</h2>

                <p>Email: {user.email}</p>
                <p>Phone: {user.phone}</p>
                <p>Address: {user.address}</p>

                <Link to="/profile/edit">Edit Profile</Link>
                <Link to="/profile/change-password">Change Password</Link>
                <Link to="/profile/change-email">Change Email</Link>
                <Link to="/addresses">Manage Addresses</Link>
            </div>
        </div>
    )
}

export default ProfilePage
