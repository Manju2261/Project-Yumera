
import { useForm } from 'react-hook-form'
import { Link, useParams, useNavigate } from 'react-router-dom'
import '../../userProfile/pages/ProfilePage.css'

//-----------------------------------------------------------
// Edit address page

function EditAddressPage() 
{
    // Get address ID and navigation function
    const { id } = useParams()
    const navigate = useNavigate()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm({
        defaultValues: {
            name: 'Manju K M',
            phone: '9876543210',
            street: 'Main Road',
            city: 'Kozhikode',
            state: 'Kerala',
            pincode: '673305'
        }
    })

    // Navigate back to address list after form validation
    const onSubmit = () => {
        navigate('/addresses')
    }

    return (
        <div className="profile-page">
            <h1>Edit Address</h1>

            <div className="profile-details">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label>Full Name</label>
                    <input
                        type="text"
                        {...register('name', {
                            required: 'Name is required'
                        })}
                    />
                    <p className="error-message">{errors.name?.message}</p>

                    <label>Phone Number</label>
                    <input
                        type="tel"
                        {...register('phone', {
                            required: 'Phone number is required'
                        })}
                    />
                    <p className="error-message">{errors.phone?.message}</p>

                    <label>House / Street Address</label>
                    <input
                        type="text"
                        {...register('street', {
                            required: 'Address is required'
                        })}
                    />
                    <p className="error-message">{errors.street?.message}</p>

                    <label>City</label>
                    <input
                        type="text"
                        {...register('city', {
                            required: 'City is required'
                        })}
                    />
                    <p className="error-message">{errors.city?.message}</p>

                    <label>State</label>
                    <input
                        type="text"
                        {...register('state', {
                            required: 'State is required'
                        })}
                    />
                    <p className="error-message">{errors.state?.message}</p>

                    <label>Pincode</label>
                    <input
                        type="text"
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

                    <button type="submit">UPDATE ADDRESS</button>
                </form>

                <p>
                <Link to="/addresses">Cancel</Link>
                </p>
            </div>
        </div>
    )
}

export default EditAddressPage
