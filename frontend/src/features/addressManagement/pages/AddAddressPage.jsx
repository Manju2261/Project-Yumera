import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import ProfileLayout from '../../userProfile/components/ProfileLayout'
import '../../userProfile/pages/ProfilePage.css'

// Add address page
function AddAddressPage() {
    const navigate = useNavigate()
    const [serverError, setServerError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        setValue,
        clearErrors,
        formState: { errors }
    } = useForm({
        mode: 'onTouched'
    })

    // Automatically fetches and fills the State when a valid 6-digit Indian pincode is entered
    const handlePincodeChange = async (event) => {
        const pin = event.target.value.trim()
        if (pin.length === 6 && /^[1-9][0-9]{5}$/.test(pin)) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
                const data = await res.json()
                if (data && data[0]?.Status === 'Success' && data[0]?.PostOffice?.length > 0) {
                    const postOffice = data[0].PostOffice[0]
                    if (postOffice.State) {
                        setValue('state', postOffice.State, { shouldValidate: true })
                        clearErrors('state')
                    }
                }
            } catch (err) {
                console.error('Pincode fetch error:', err)
            }
        }
    }

    // Saves the new address through the backend API
    const onSubmit = async (data) => {
        try {
            setServerError('')
            setIsLoading(true)

            const response = await api.post('/user/addresses', {
                fullName: data.fullName,
                phone: data.phone,
                addressLine: data.addressLine,
                city: data.city,
                state: data.state,
                pincode: data.pincode,
                isDefault: false
            })

            if (response.data.success) {
                navigate('/addresses')
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to save address. Please try again.'
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <ProfileLayout
            title="Add New Address"
            subtitle="Add a new shipping destination for your orders"
        >
            <div className="edit-profile-card">
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="edit-profile-form">
                    <div className="edit-form-field">
                        <label>Full Name</label>
                        <input
                            type="text"
                            maxLength={50}
                            placeholder="Enter recipient's full name"
                            {...register('fullName', {
                                required: 'Full name is required',
                                validate: value => {
                                    const trimmed = value.trim()
                                    if (!trimmed) return 'Full name is required'
                                    if (trimmed.length < 2) return 'Full name must be at least 2 characters'
                                    if (trimmed.length > 50) return 'Full name cannot exceed 50 characters'
                                    if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'Name should contain only letters'
                                    return true
                                }
                            })}
                        />
                        <p className="error-message">{errors.fullName?.message}</p>
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

                    <div className="edit-form-field">
                        <label>House / Street / Flat Address</label>
                        <input
                            type="text"
                            maxLength={100}
                            placeholder="Enter detailed street address"
                            {...register('addressLine', {
                                required: 'Address is required',
                                validate: value => {
                                    const trimmed = value.trim()
                                    if (!trimmed) return 'Address is required'
                                    if (trimmed.length < 5) return 'Address must be at least 5 characters'
                                    if (trimmed.length > 100) return 'Address cannot exceed 100 characters'
                                    return true
                                }
                            })}
                        />
                        <p className="error-message">{errors.addressLine?.message}</p>
                    </div>

                    <div className="address-form-grid">
                        <div className="edit-form-field">
                            <label>City</label>
                            <input
                                type="text"
                                maxLength={50}
                                placeholder="Enter city"
                                {...register('city', {
                                    required: 'City is required',
                                    validate: value => {
                                        const trimmed = value.trim()
                                        if (!trimmed) return 'City is required'
                                        if (trimmed.length < 2) return 'City must be at least 2 characters'
                                        if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'City should contain only letters'
                                        return true
                                    }
                                })}
                            />
                            <p className="error-message">{errors.city?.message}</p>
                        </div>

                        <div className="edit-form-field">
                            <label>State</label>
                            <input
                                type="text"
                                maxLength={50}
                                placeholder="Enter state"
                                {...register('state', {
                                    required: 'State is required',
                                    validate: value => {
                                        const trimmed = value.trim()
                                        if (!trimmed) return 'State is required'
                                        if (trimmed.length < 2) return 'State must be at least 2 characters'
                                        if (!/^[A-Za-z\s]+$/.test(trimmed)) return 'State should contain only letters'
                                        return true
                                    }
                                })}
                            />
                            <p className="error-message">{errors.state?.message}</p>
                        </div>
                    </div>

                    <div className="edit-form-field">
                        <label>Pincode</label>
                        <input
                            type="text"
                            placeholder="Enter 6-digit pincode"
                            maxLength={6}
                            onKeyDown={(e) => {
                                if (
                                    !/[0-9]/.test(e.key) &&
                                    !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)
                                ) {
                                    e.preventDefault()
                                }
                            }}
                            {...register('pincode', {
                                required: 'Pincode is required',
                                onChange: handlePincodeChange,
                                validate: value => {
                                    const trimmed = value.trim()
                                    if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
                                        return 'Enter a valid 6-digit Indian pincode'
                                    }
                                    return true
                                }
                            })}
                        />
                        <p className="error-message">{errors.pincode?.message}</p>
                    </div>

                    <div className="edit-form-actions">
                        <button type="submit" className="profile-save-btn" disabled={isLoading}>
                            {isLoading ? 'SAVING...' : 'SAVE ADDRESS →'}
                        </button>
                        <Link to="/addresses" className="profile-cancel-btn">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </ProfileLayout>
    )
}

export default AddAddressPage