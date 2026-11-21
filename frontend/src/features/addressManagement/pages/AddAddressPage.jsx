import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import '../../userProfile/pages/ProfilePage.css'

//--------------------------------------------------------
// Add address page

function AddAddressPage() 
{
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm()

    // Handle address form submission
    const onSubmit = () => {
        // Address will be saved through the backend API later
    }

    return (
        <div className="profile-page add-address-page">
            <h1>Add New Address</h1>

            <div className="profile-details add-address-form">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        placeholder="Enter your full name"
                        {...register('name', {
                            required: 'Name is required'
                        })}
                    />
                    <p className="error-message">{errors.name?.message}</p>

                    <label>Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Enter phone number"
                        {...register('phone', {
                            required: 'Phone number is required'
                        })}
                    />
                    <p className="error-message">{errors.phone?.message}</p>

                    <label>House / Street Address</label>
                    <input
                        type="text"
                        placeholder="Enter your address"
                        {...register('street', {
                            required: 'Address is required'
                        })}
                    />
                    <p className="error-message">{errors.street?.message}</p>

                    <label>City</label>
                    <input
                        type="text"
                        placeholder="Enter city"
                        {...register('city', {
                            required: 'City is required'
                        })}
                    />
                    <p className="error-message">{errors.city?.message}</p>

                    <label>State</label>
                    <input
                        type="text"
                        placeholder="Enter state"
                        {...register('state', {
                            required: 'State is required'
                        })}
                    />
                    <p className="error-message">{errors.state?.message}</p>

                    <label>Pincode</label>
                    <input
                        type="text"
                        placeholder="Enter 6-digit pincode"
                        maxLength={6}
                        {...register('pincode', {
                            required: 'Pincode is required',
                            pattern: {
                                value: /^[0-9]{6}$/,
                                message: 'Enter a valid 6-digit pincode'
                        }
                        })}
                    />
                    <p className="error-message">{errors.pincode?.message}</p>

                    {/* Form actions */}
                    <div className="address-form-actions">
                        <button type="submit">SAVE ADDRESS</button>
                        <Link to="/addresses">CANCEL</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddAddressPage