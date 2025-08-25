import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateProfile, resetMockProfile, users, changeSelectedUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    position: '',
    phone: '',
    address: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        position: user.position || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

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

    console.log('Submitting profile data:', formData);

    try {
      const result = await updateProfile(formData);
      console.log('Update result:', result);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully! Your changes have been saved.' });
        setIsEditing(false);
        
        // Update form data to reflect the new values
        setFormData({
          fullName: formData.fullName,
          email: formData.email,
          position: formData.position,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio
        });
        
        console.log('Profile updated successfully');
      } else {
        setMessage({ type: 'error', text: result.message });
        console.log('Profile update failed:', result.message);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to update profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName || '',
      email: user.email || '',
      position: user.position || '',
      phone: user.phone || '',
      address: user.address || '',
      bio: user.bio || ''
    });
    setIsEditing(false);
    setMessage({ type: '', text: '' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar">
              {user.fullName?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="user-details">
              <h2>{user.fullName || 'User'}</h2>
              <p>{user.position} • {user.role}</p>
            </div>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="back-button"
            >
              ← Back to Dashboard
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="profile-content">
          {/* Profile Header */}
          <section className="profile-hero">
            <div className="profile-cover">
              <div className="profile-avatar-large">
                {user.fullName?.charAt(0) || user.email?.charAt(0)}
              </div>
            </div>
            <div className="profile-info">
              <h1>{user.fullName || 'User Profile'}</h1>
              <p>{user.position} • {user.role}</p>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="edit-profile-button"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </section>

          {/* Message Display */}
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Profile Form */}
          <section className="profile-form-section">
            <div className="form-container">
              <h2>Personal Information</h2>
              
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullName">Full Name *</label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
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
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="position">Position</label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Form Actions */}
                {isEditing && (
                  <div className="form-actions">
                    <button 
                      type="submit" 
                      className="save-button"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button 
                      type="button" 
                      onClick={handleCancel}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </section>

          {/* Account Security */}
          <section className="security-section">
            <div className="security-container">
              <h2>Account Security</h2>
              <div className="security-items">
                <div className="security-item">
                  <div className="security-info">
                    <h3>Password</h3>
                    <p>Last changed: Never</p>
                  </div>
                  <button 
                    onClick={() => navigate('/change-password')}
                    className="change-password-button"
                  >
                    Change Password
                  </button>
                </div>
                
                
              </div>
            </div>
          </section>

                    {/* Mock Data Management */}
          <section className="mock-data-section">
            <div className="mock-data-container">
              <h2>MockAPI Integration</h2>
              <p className="mock-data-description">
                This section is connected to your MockAPI endpoint. Profile changes are saved directly to the API.
              </p>
              <div className="mock-data-info">
                <p><strong>API Endpoint:</strong> https://68911551944bf437b59833cb.mockapi.io/users</p>
                <p><strong>Current User ID:</strong> {user.id}</p>
                <p><strong>Last Updated:</strong> {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : 'Never'}</p>
                <p><strong>Total Users:</strong> {users.length}</p>
              </div>
              
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
