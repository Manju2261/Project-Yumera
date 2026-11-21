import { useState } from 'react'
import '../../userProfile/pages/ProfilePage.css'
import ConfirmationModal from '../../../components/common/ConfirmationModal'

// Admin user management page
function AdminUsersPage() {
    const [users, setUsers] = useState([
        {
            id: 1,
            name: 'Manju K M',
            email: 'manju@example.com',
            status: 'Active',
            createdAt: '2026-11-20T10:10:00'
        },
        {
            id: 2,
            name: 'Test User',
            email: 'test@example.com',
            status: 'Blocked',
            createdAt: '2026-10-20T10:00:20'
        },
        {
            id: 3,
            name: 'Arun Kumar',
            email: 'arun@example.com',
            status: 'Active',
            createdAt: '2026-11-18T10:00:00'
        },
        {
            id: 4,
            name: 'Brun Kumar',
            email: 'brun@example.com',
            status: 'Active',
            createdAt: '2026-11-10T10:00:01'
        },
        {
            id: 5,
            name: 'Crun Kumar',
            email: 'crun@example.com',
            status: 'Active',
            createdAt: '2026-11-15T10:00:00'
        },
        {
            id: 6,
            name: 'Drun Kumar',
            email: 'drun@example.com',
            status: 'Active',
            createdAt: '2026-10-20T10:00:00'
        },
        {
            id: 7,
            name: 'Erun Kumar',
            email: 'erun@example.com',
            status: 'Active',
            createdAt: '2026-11-12T10:00:00'
        }
    ])

    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUserId, setSelectedUserId] = useState(null)

    const usersPerPage = 5

    // Filter users based on search term
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Sort users by latest registration date
    const sortedUsers = [...filteredUsers].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    )

    // Calculate pagination
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage)
    const indexOfLastUser = currentPage * usersPerPage
    const indexOfFirstUser = indexOfLastUser - usersPerPage

    const currentUsers = sortedUsers.slice(
        indexOfFirstUser,
        indexOfLastUser
    )

    // Find the user selected for block or unblock
    const selectedUser = users.find(user => user.id === selectedUserId)

    // Open confirmation modal
    const toggleUserStatus = (id) => {
        setSelectedUserId(id)
    }

    // Update user status after confirmation
    const confirmStatusChange = () => {
        setUsers(prevUsers =>
            prevUsers.map(user =>
                user.id === selectedUserId
                    ? {
                        ...user,
                        status: user.status === 'Active' ? 'Blocked' : 'Active'
                    }
                    : user
            )
        )

        setSelectedUserId(null)
    }

    // Close confirmation modal without changing status
    const cancelStatusChange = () => {
        setSelectedUserId(null)
    }

    return (
        <div className="profile-page">
            <h1>User Management</h1>

            {/* Search users and reset pagination */}
            <input
                type="text"
                placeholder="Search users by name or email"
                value={searchTerm}
                onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                }}
            />

            {/* Clear search */}
            <button
                type="button"
                onClick={() => {
                    setSearchTerm('')
                    setCurrentPage(1)
                }}
            >
                Clear
            </button>

            {/* Display filtered users */}
            {currentUsers.map(user => (
                <div className="profile-details" key={user.id}>
                    <h2>{user.name}</h2>
                    <p>Email: {user.email}</p>
                    <p>Status: {user.status}</p>

                    <button
                        type="button"
                        onClick={() => toggleUserStatus(user.id)}
                    >
                        {user.status === 'Active' ? 'Block User' : 'Unblock User'}
                    </button>
                </div>
            ))}

            {/* Display message when no users are found */}
            {currentUsers.length === 0 && (
                <p>No users found.</p>
            )}

            {/* Pagination controls */}
            {totalPages > 0 && (
                <div className="pagination">
                    <button
                        type="button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                    >
                        Previous
                    </button>

                    <span>
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        type="button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(currentPage + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Block or unblock confirmation modal */}
            {selectedUser && (
                <ConfirmationModal
                    message={`Are you sure you want to ${
                        selectedUser.status === 'Active' ? 'block' : 'unblock'
                    } this user?`}
                    onConfirm={confirmStatusChange}
                    onCancel={cancelStatusChange}
                />
            )}
        </div>
    )
}

export default AdminUsersPage