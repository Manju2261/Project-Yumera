
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import "./ProfilePage.css"

//-------------------------------------------------------
// Edit profile page

function EditProfilePage() 
{
    const navigate = useNavigate()
    const {
        register,
        handleSubmit
    } = useForm({
            defaultValues: {
            name: 'Manju K M',
            phone: '9876543210'
            }
        })

    // Handle profile update and return to profile page
    const onSubmit = () => {
        navigate('/profile')
    }

    return (
        <div className="profile-page">
            <h1>Edit Profile</h1>

            <div className="profile-details">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Profile Image</label>
                    <input type="file" accept="image/*" />

                    <label>Full Name</label>
                    <input
                        type="text"
                        {...register('name', {
                            required: 'Name is required',
                            validate: value => value.trim() !== '' || 'Name cannot be empty'
                        })}
                    />

                    <label>Phone Number</label>
                    <input
                        type="tel"
                        {...register('phone', {
                            required: 'Phone number is required'
                        })}
                    />

                    <button type="submit">UPDATE PROFILE</button>
                </form>

                <p>
                    <Link to="/profile">Cancel</Link>
                </p>
            </div>
        </div>
    )
}

export default EditProfilePage
