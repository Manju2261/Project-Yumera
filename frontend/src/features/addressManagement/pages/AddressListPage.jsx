import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../../services/api'
import ConfirmationModal from '../../../components/common/ConfirmationModal'
import ProfileLayout from '../../userProfile/components/ProfileLayout'
import '../../userProfile/pages/ProfilePage.css'

// Address list page
function AddressListPage() {
    const [addresses, setAddresses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [serverError, setServerError] = useState('')

    const [showModal, setShowModal] = useState(false)
    const [selectedAddressId, setSelectedAddressId] = useState(null)

    // Fetches the user's saved addresses from the backend
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const response = await api.get('/user/profile')

                if (response.data.success) {
                    setAddresses(response.data.user.addresses || [])
                }
            } catch (error) {
                setServerError(
                    error.response?.data?.message ||
                    'Unable to load addresses. Please try again.'
                )
            } finally {
                setIsLoading(false)
            }
        }

        fetchAddresses()
    }, [])

    const deleteAddress = (id) => {
        setSelectedAddressId(id)
        setShowModal(true)
    }

    // Deletes the selected address
    const confirmDelete = async () => {
        try {
            setServerError('')

            const response = await api.delete(
                `/user/addresses/${selectedAddressId}`
            )

            if (response.data.success) {
                setAddresses(response.data.addresses || [])
                setShowModal(false)
                setSelectedAddressId(null)
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to delete address. Please try again.'
            )
        }
    }

    // Sets default address
    const setDefaultAddress = async (id) => {
        try {
            setServerError('')

            const response = await api.patch(
                `/user/addresses/${id}/default`
            )

            if (response.data.success) {
                setAddresses(response.data.addresses || [])
            }
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Unable to set default address. Please try again.'
            )
        }
    }

    const cancelDelete = () => {
        setShowModal(false)
        setSelectedAddressId(null)
    }

    return (
        <ProfileLayout
            title="My Addresses"
            subtitle="Manage your delivery addresses for seamless shopping and checkout"
        >
            <div className="addresses-container">
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                {/* Section Header */}
                <div className="addresses-header">
                    <h2>Saved Addresses</h2>
                    <Link to="/address/add" className="add-new-address-btn">
                        + Add New Address
                    </Link>
                </div>

                {isLoading ? (
                    <p className="profile-loading-text">Loading addresses...</p>
                ) : addresses.length === 0 ? (
                    <div className="empty-addresses-box">
                        <p>You haven't saved any delivery addresses yet.</p>
                        <Link to="/address/add" className="add-new-address-btn">
                            + Add Your First Address
                        </Link>
                    </div>
                ) : (
                    <div className="addresses-grid">
                        {addresses.map((address) => (
                            <div
                                key={address._id}
                                className={`address-item-card ${address.isDefault ? 'is-default' : ''}`}
                            >
                                <div>
                                    <div className="address-card-top">
                                        <h3 className="address-card-name">{address.fullName}</h3>
                                        {address.isDefault ? (
                                            <span className="default-badge">Default</span>
                                        ) : (
                                            <button
                                                type="button"
                                                className="set-default-btn"
                                                onClick={() => setDefaultAddress(address._id)}
                                            >
                                                Set as Default
                                            </button>
                                        )}
                                    </div>

                                    <div className="address-card-details">
                                        <p>{address.addressLine}</p>
                                        <p>{address.city}, {address.state} - {address.pincode}</p>
                                        <p className="address-card-phone">📞 {address.phone}</p>
                                    </div>
                                </div>

                                <div className="address-card-actions">
                                    <Link to={`/address/edit/${address._id}`} className="addr-edit-link">
                                        Edit ✏️
                                    </Link>
                                    <button
                                        type="button"
                                        className="addr-delete-btn"
                                        onClick={() => deleteAddress(address._id)}
                                    >
                                        Delete 🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showModal && (
                    <ConfirmationModal
                        message="Are you sure you want to delete this address?"
                        onConfirm={confirmDelete}
                        onCancel={cancelDelete}
                    />
                )}
            </div>
        </ProfileLayout>
    )
}

export default AddressListPage