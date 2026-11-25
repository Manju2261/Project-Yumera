import { useState, useEffect } from 'react'
import api from '../../../services/api'
import AdminLayout from '../../../layouts/AdminLayout'
import ConfirmationModal from '../../../components/common/ConfirmationModal'
import './AdminUsersPage.css'

// Admin user management page
function AdminUsersPage() {
    const [users, setUsers] = useState([])
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 0,
        totalUsers: 0,
        limit: 5
    })
    const [isLoading, setIsLoading] = useState(true)
    const [serverError, setServerError] = useState('')

    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedUserId, setSelectedUserId] = useState(null)

    // Fetches users whenever pagination or search changes
    useEffect(() => {
        let isMounted = true

        const loadUsers = async () => {
            try {
                setIsLoading(true)

                const response = await api.get('/admin/users', {
                    params: {
                        page: currentPage,
                        limit: pagination.limit,
                        search: searchTerm
                    }
                })

                if (isMounted) {
                    setUsers(response.data.users)
                    setPagination(response.data.pagination)
                    setServerError('')
                }
            } catch (error) {
                if (isMounted) {
                    setServerError(
                        error.response?.data?.message ||
                        'Failed to fetch users. Please try again.'
                    )
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadUsers()

        return () => {
            isMounted = false
        }
    }, [currentPage, pagination.limit, searchTerm])

    // Finds the selected user for block/unblock modal
    const selectedUser = users.find(user => user._id === selectedUserId)

    const toggleUserStatus = (id) => {
        setSelectedUserId(id)
    }

    // Updates user block status
    const confirmStatusChange = async () => {
        try {
            setServerError('')

            const endpoint = selectedUser.isBlocked
                ? `/admin/users/${selectedUserId}/unblock`
                : `/admin/users/${selectedUserId}/block`

            await api.patch(endpoint)

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user._id === selectedUserId
                        ? { ...user, isBlocked: !selectedUser.isBlocked }
                        : user
                )
            )
            setSelectedUserId(null)
        } catch (error) {
            setServerError(
                error.response?.data?.message ||
                'Failed to update user status. Please try again.'
            )
        }
    }

    const cancelStatusChange = () => {
        setSelectedUserId(null)
    }

    return (
        <AdminLayout>
            <div className="admin-users-page">
                {/* Page Header */}
                <div className="admin-page-header">
                    <div className="admin-page-title">
                        <h1>Customer Management</h1>
                    </div>

                    {pagination.totalUsers > 0 && (
                        <div className="admin-stats-badge">
                            Total Users: {pagination.totalUsers}
                        </div>
                    )}
                </div>

                {/* Search & Actions Bar */}
                <div className="admin-actions-bar">
                    <div className="admin-search-box">
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value)
                                setCurrentPage(1)
                            }}
                        />
                    </div>

                    {searchTerm && (
                        <button
                            type="button"
                            className="admin-clear-btn"
                            onClick={() => {
                                setSearchTerm('')
                                setCurrentPage(1)
                            }}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Error Banner */}
                {serverError && (
                    <p className="error-message">{serverError}</p>
                )}

                {/* Table Card */}
                <div className="admin-table-card">
                    {isLoading ? (
                        <div className="admin-empty-state">Loading users...</div>
                    ) : users.length === 0 ? (
                        <div className="admin-empty-state">No users found.</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th className="col-idx">Sl.No</th>
                                    <th className="col-user">Customer</th>
                                    <th className="col-email">Email</th>
                                    <th className="col-phone">Phone</th>
                                    <th className="col-status">Status</th>
                                    <th className="col-action">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user._id}>
                                        <td className="col-idx">
                                            {(pagination.currentPage - 1) * pagination.limit + index + 1}
                                        </td>
                                        <td className="col-user">
                                            <div className="user-cell">
                                                <div className="user-avatar">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <span className="user-name">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="col-email">{user.email}</td>
                                        <td className="col-phone">{user.phone || '—'}</td>
                                        <td className="col-status">
                                            <span className={`status-badge ${user.isBlocked ? 'blocked' : 'active'}`}>
                                                <span className="status-dot"></span>
                                                {user.isBlocked ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="col-action">
                                            <button
                                                type="button"
                                                className={`user-action-btn ${user.isBlocked ? 'unblock' : 'block'}`}
                                                onClick={() => toggleUserStatus(user._id)}
                                            >
                                                {user.isBlocked ? 'Unblock' : 'Block'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {pagination.totalPages > 0 && (
                        <div className="admin-pagination-bar">
                            <span className="pagination-info">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <div className="pagination-controls">
                                <button
                                    type="button"
                                    className="pagination-btn"
                                    disabled={pagination.currentPage === 1 || isLoading}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    className="pagination-btn"
                                    disabled={pagination.currentPage === pagination.totalPages || isLoading}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirmation Modal */}
                {selectedUser && (
                    <ConfirmationModal
                        message={`Are you sure you want to ${selectedUser.isBlocked ? 'unblock' : 'block'} ${selectedUser.name}?`}
                        onConfirm={confirmStatusChange}
                        onCancel={cancelStatusChange}
                    />
                )}
            </div>
        </AdminLayout>
    )
}

export default AdminUsersPage