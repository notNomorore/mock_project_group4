import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './UserManagement.css';

const UserManagement = () => {
  const { 
    users, 
    createUser, 
    updateUser, 
    deleteUser, 
    refreshUsers,
    toggleUserStatus,
    user: currentUser 
  } = useAuth();
  
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'staff',
    position: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Debounce search (500ms)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Derived users: search + filter + sort
  const getDerivedUsers = () => {
    const query = debouncedSearch.trim().toLowerCase();
    const filtered = users.filter(u => {
      const okStatus = statusFilter === 'all' || u.status === statusFilter;
      const okRole = roleFilter === 'all' || u.role === roleFilter;
      const okQuery = !query || (
        (u.fullName || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        (u.position || '').toLowerCase().includes(query)
      );
      return okStatus && okRole && okQuery;
    });

    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortBy] ?? '';
      let bVal = b[sortBy] ?? '';

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aVal = aVal ? new Date(aVal).getTime() : 0;
        bVal = bVal ? new Date(bVal).getTime() : 0;
      } else {
        aVal = typeof aVal === 'string' ? aVal.toLowerCase() : aVal;
        bVal = typeof bVal === 'string' ? bVal.toLowerCase() : bVal;
      }

      if (aVal === bVal) return 0;
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    return sorted;
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'staff',
      position: '',
      status: 'active'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await createUser(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'User created successfully!' });
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to create user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await updateUser(selectedUser.id, formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'User updated successfully!' });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        resetForm();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await deleteUser(selectedUser.id);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'User deleted successfully!' });
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const result = await toggleUserStatus(userId);
      
      if (result.success) {
        const statusText = result.user.status === 'active' ? 'activated' : 'deactivated';
        setMessage({ 
          type: 'success', 
          text: `User ${statusText} successfully!${result.message ? ' ' + result.message : ''}` 
        });
        
        // Nếu user hiện tại bị deactivate, redirect to login
        if (result.message && result.message.includes('đăng xuất')) {
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to toggle user status. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '', // Don't show password in edit
      role: user.role || 'staff',
      position: user.position || '',
      status: user.status || 'active'
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedUser(null);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="user-management-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You need admin privileges to access User Management.</p>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      {/* Header */}
      <header className="user-management-header">
        <div className="header-content">
          <div className="header-info">
            <h1>User Management</h1>
            <p>Manage all users in the system</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="back-button"
            >
              ← Back to Dashboard
            </button>
            <button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="create-user-button"
            >
              ➕ Create User
            </button>
            
          </div>
        </div>
      </header>

      {/* Message Display */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Main Content */}
      <main className="user-management-main">
        <div className="users-table-container">
          <div className="table-header">
            <h2>All Users ({getDerivedUsers().length})</h2>
          </div>
          <div className="table-controls">
            <div className="control">
              <label htmlFor="searchUM">Search</label>
              <input
                id="searchUM"
                type="text"
                placeholder="Search name, email, position..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="control">
              <label htmlFor="statusUM">Status</label>
              <select id="statusUM" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="control">
              <label htmlFor="roleUM">Role</label>
              <select id="roleUM" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <div className="control">
              <label htmlFor="sortByUM">Sort by</label>
              <select id="sortByUM" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="fullName">Name</option>
                <option value="createdAt">Created At</option>
                <option value="updatedAt">Updated At</option>
              </select>
            </div>
            <div className="control">
              <label htmlFor="orderUM">Order</label>
              <select id="orderUM" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="asc">Asc</option>
                <option value="desc">Desc</option>
              </select>
            </div>
          </div>
          
          <div className="users-table">
            <div className="table-row header">
              <div className="table-cell">Avatar</div>
              <div className="table-cell">Name</div>
              <div className="table-cell">Email</div>
              <div className="table-cell">Position</div>
              <div className="table-cell">Role</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Created</div>
              <div className="table-cell">Actions</div>
            </div>
            
            {getDerivedUsers().map(user => (
              <div key={user.id} className="table-row">
                <div className="table-cell">
                  <div className="user-avatar">
                    {user.fullName?.charAt(0) || user.email?.charAt(0)}
                  </div>
                </div>
                <div className="table-cell">
                  <div className="user-name">
                    <strong>{user.fullName}</strong>
                  </div>
                </div>
                <div className="table-cell">
                  <span className="user-email">{user.email}</span>
                </div>
                <div className="table-cell">
                  <span className="user-position">{user.position}</span>
                </div>
                <div className="table-cell">
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${user.status}`}>
                    {user.status}
                  </span>
                </div>
                <div className="table-cell">
                  <span className="user-created">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="table-cell">
                  <div className="action-buttons">
                    <button 
                      onClick={() => openEditModal(user)}
                      className="edit-button"
                      title="Edit User"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user.id)}
                      className={`toggle-button ${user.status === 'active' ? 'deactivate' : 'activate'}`}
                      title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                      disabled={user.id === currentUser.id}
                    >
                      {user.status === 'active' ? '🔓' : '🔒'}
                    </button>
                    <button 
                      onClick={() => openDeleteModal(user)}
                      className="delete-button"
                      title="Delete User"
                      disabled={user.id === currentUser.id}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Create New User</h2>
              <button onClick={closeModals} className="close-button">×</button>
            </div>
            <form onSubmit={handleCreateUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeModals}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit User: {selectedUser.fullName}</h2>
              <button onClick={closeModals} className="close-button">×</button>
            </div>
            <form onSubmit={handleEditUser} className="modal-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password">New Password (leave blank to keep current)</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="role">Role *</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="status">Status *</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="position">Position</label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeModals}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="modal-overlay">
          <div className="modal delete-modal">
            <div className="modal-header">
              <h2>Delete User</h2>
              <button onClick={closeModals} className="close-button">×</button>
            </div>
            <div className="modal-content">
              <div className="delete-warning">
                <p>Are you sure you want to delete this user?</p>
                <div className="user-to-delete">
                  <div className="user-avatar">
                    {selectedUser.fullName?.charAt(0) || selectedUser.email?.charAt(0)}
                  </div>
                  <div className="user-info">
                    <h3>{selectedUser.fullName}</h3>
                    <p>{selectedUser.email}</p>
                    <p>{selectedUser.position} • {selectedUser.role}</p>
                  </div>
                </div>
                <p className="warning-text">
                  <strong>Warning:</strong> This action cannot be undone. All user data will be permanently deleted.
                </p>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeModals}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={handleDeleteUser}
                  className="delete-confirm-button"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
