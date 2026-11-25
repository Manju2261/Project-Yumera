import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { setCredentials } from '../../authentication/authSlice'
import ProfileLayout from '../components/ProfileLayout'
import './ProfilePage.css'

// Edit profile page
function EditProfilePage() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const user = useSelector(state => state.auth.user)

    const [profileImage, setProfileImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        mode: 'onTouched',
        defaultValues: {
            name: '',
            phone: ''
        }
    })

    // Fetches complete user details and fills the edit form
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/user/profile')

                reset({
                    name: response.data.user.name || '',
                    phone: response.data.user.phone || ''
                })
            } catch (error) {
                setServerError(
                    error.response?.data?.message ||
                    'Unable to load profile details.'
                )
            }
        }

        fetchProfile()
    }, [reset])

    // Updates profile details and image
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.patch('/user/profile', {
                name: data.name,
                phone: data.phone
            })

            if (response.data.success) {
                let updatedUser = {
                    ...user,
                    ...response.data.user
                }

                // Uploads the selected profile image if any
                if (profileImage) {
                    const formData = new FormData()
                    formData.append('profileImage', profileImage)

                    await api.post('/user/profile/image', formData)

                    // Fetches the updated profile image URL
                    const profileResponse = await api.get('/user/profile')
                    updatedUser = profileResponse.data.user
                }

                dispatch(setCredentials(updatedUser))
                navigate('/profile')
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to update profile. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setProfileImage(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    return (
        <ProfileLayout
            title="Edit Profile"
            subtitle="Update your profile photo, full name and contact number"
        >
            <div className="edit-profile-card">
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                {/* Avatar Preview & Upload */}
                <div className="avatar-upload-section">
                    <div className="avatar-preview-box">
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" />
                        ) : user?.profileImageUrl ? (
                            <img src={user.profileImageUrl} alt="Profile" />
                        ) : (
                            <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                        )}
                    </div>

                    <div className="avatar-upload-info">
                        <h4>Profile Picture</h4>
                        <p>JPG, PNG or WEBP (Max 5MB)</p>
                        <label className="file-input-label">
                            Choose Photo 📷
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                        </label>
                    </div>
                </div>

                {/* Edit Details Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="edit-profile-form">
                    <div className="edit-form-field">
                        <label>Full Name</label>
                        <input
                            type="text"
                            maxLength={50}
                            placeholder="Enter your full name"
                            {...register('name', {
                                required: 'Full name is required',
                                validate: value => {
                                    const trimmed = value.trim()
                                    if (!trimmed) return 'Name cannot be empty'
                                    if (trimmed.length < 2) return 'Name must be at least 2 characters'
                                    if (trimmed.length > 50) return 'Name cannot exceed 50 characters'
                                    if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'Name should contain only letters'
                                    return true
                                }
                            })}
                        />
                        <p className="error-message">{errors.name?.message}</p>
                    </div>

                    <div className="edit-form-field">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            maxLength={10}
                            onKeyDown={(e) => {
                                if (
                                    !/[0-9]/.test(e.key) &&
                                    !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                                ) {
                                    e.preventDefault()
                                }
                            }}
                            placeholder="Enter 10-digit phone number"
                            {...register('phone', {
                                required: 'Phone number is required',
                                validate: value => {
                                    const trimmed = value.trim()
                                    if (!/^[6-9]\d{9}$/.test(trimmed)) {
                                        return 'Enter a valid 10-digit Indian phone number (starting with 6-9)'
                                    }
                                    return true
                                }
                            })}
                        />
                        <p className="error-message">{errors.phone?.message}</p>
                    </div>

                    <div className="edit-form-actions">
                        <button type="submit" className="profile-save-btn" disabled={isLoading}>
                            {isLoading ? 'SAVING...' : 'SAVE CHANGES →'}
                        </button>

                        <Link to="/profile" className="profile-cancel-btn">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    )
}

export default EditProfilePage