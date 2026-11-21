import { useState } from 'react'
import { Link } from 'react-router-dom'
import ConfirmationModal from '../../../components/common/ConfirmationModal'

// Address list page
function AddressListPage() {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: 'Home',
            address: 'Koyilandy, Kozhikode, Kerala',
            phone: '9876543210'
        },
        {
            id: 2,
            name: 'Office',
            address: 'Kozhikode, Kerala',
            phone: '9876543210'
        }
    ])

    const [showModal, setShowModal] = useState(false)
    const [selectedAddressId, setSelectedAddressId] = useState(null)

    // Open confirmation modal for address deletion
    const deleteAddress = (id) => {
        setSelectedAddressId(id)
        setShowModal(true)
    }

    // Delete selected address after confirmation
    const confirmDelete = () => {
        setAddresses(prevAddresses =>
            prevAddresses.filter(address => address.id !== selectedAddressId)
        )

        setShowModal(false)
        setSelectedAddressId(null)
    }

    // Close modal without deleting the address
    const cancelDelete = () => {
        setShowModal(false)
        setSelectedAddressId(null)
    }

    return (
        <div className="profile-page">
            <h1>My Addresses</h1>

            <Link to="/address/add">Add New Address</Link>

            {addresses.map((address) => (
                <div className="profile-details" key={address.id}>
                    <h2>{address.name}</h2>
                    <p>{address.address}</p>
                    <p>Phone: {address.phone}</p>

                    <div className="address-actions">
                        <Link to={`/address/edit/${address.id}`}>Edit</Link>

                        <button
                            type="button"
                            onClick={() => deleteAddress(address.id)}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}

            {addresses.length === 0 && <p>No addresses found.</p>}

            {showModal && (
                <ConfirmationModal
                    message="Are you sure you want to delete this address?"
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}
        </div>
    )
}

export default AddressListPage