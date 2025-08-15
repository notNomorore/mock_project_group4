import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './ChangePassword.css';

const ChangePassword = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validation
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match!' });
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long!' });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put('http://localhost:5000/api/users/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully! You will be logged out.' });
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Logout after 2 seconds
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="change-password-container">
      {/* Header */}
      <header className="change-password-header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar">
              {user.fullName?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="user-details">
              <h2>Change Password</h2>
              <p>{user.fullName || 'User'}</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/profile')} 
              className="back-button"
            >
              ← Back to Profile
            </button>
            <button onClick={() => logout()} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="change-password-main">
        <div className="change-password-content">
          <div className="form-container">
            <h2>Change Your Password</h2>
            <p className="form-description">
              Enter your current password and choose a new password to update your account security.
            </p>
            
            {/* Message Display */}
            {message.text && (
              <div className={`message ${message.type}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="change-password-form">
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password *</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">New Password *</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your new password"
                  minLength="6"
                />
                <small className="password-hint">
                  Password must be at least 6 characters long
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  placeholder="Confirm your new password"
                />
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={loading}
                >
                  {loading ? 'Changing Password...' : 'Change Password'}
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChangePassword;
