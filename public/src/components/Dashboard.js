import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import axios from 'axios';
import './Dashboard.css';

// MockAPI endpoint
const MOCK_API_URL = 'https://68911551944bf437b59833cb.mockapi.io/users';

const Dashboard = () => {
  const { user, logout, isAdmin, isStaff } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Debounce search term (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(MOCK_API_URL);
      setUsers(response.data);
      console.log('Users fetched for dashboard:', response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users from MockAPI');
    } finally {
      setLoading(false);
    }
  };

  // Derived users: search + filter + sort on FE
  const getDerivedUsers = () => {
    const query = debouncedSearch.trim().toLowerCase();

    const filtered = users.filter(u => {
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesQuery = !query || (
        (u.fullName || '').toLowerCase().includes(query) ||
        (u.email || '').toLowerCase().includes(query) ||
        (u.position || '').toLowerCase().includes(query)
      );
      return matchesStatus && matchesRole && matchesQuery;
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    const badgeClass = role === 'admin' ? 'badge-warning' : 'badge-info';
    return <span className={`badge ${badgeClass}`}>{role}</span>;
  };

  const getStatusBadge = (status) => {
    const badgeClass = status === 'active' ? 'badge-success' : 'badge-danger';
    return <span className={`badge ${badgeClass}`}>{status}</span>;
  };

  const getStatIcon = (type) => {
    const icons = {
      users: '👥',
      active: '✅',
      admins: '👑',
      staff: '👨‍💼'
    };
    return icons[type] || '📊';
  };

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="user-info">
              <div className="user-avatar">
                {user.fullName?.charAt(0) || user.email?.charAt(0)}
              </div>
              <div className="user-details">
                <h2 className="user-name">{user.fullName || 'User'}</h2>
                <p className="user-role">{user.position} • {getRoleBadge(user.role)}</p>
              </div>
            </div>
          </div>
          
          <div className="header-right">
            <ThemeToggle className="header-theme-toggle" />
            <button onClick={handleLogout} className="btn btn-ghost logout-button">
              <svg className="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-content">
          <div className="nav-section">
            
            <ul className="nav-menu">
              <li className="nav-item active">
                <span className="nav-icon">🏠</span>
                <span className="nav-text">Dashboard</span>
              </li>
              
              <li className="nav-item">
                <span className="nav-icon">👤</span>
                <button onClick={() => navigate('/profile')} className="nav-link">
                  Profile
                </button>
              </li>

              {user.role === 'admin' && (
                <li className="nav-item">
                  <span className="nav-icon">👥</span>
                  <button onClick={() => navigate('/user-management')} className="nav-link">
                    User Management
                  </button>
                </li>
              )}
              
              <li className="nav-item">
                <span className="nav-icon">📊</span>
                <span className="nav-text">Reports</span>
              </li>
              
              
              
              <li className="nav-item">
                <span className="nav-icon">⚙️</span>
                <span className="nav-text">Settings</span>
              </li>
            </ul>
          </div>

          {isAdmin && (
            <div className="nav-section">
              <h3 className="nav-title">Admin Tools</h3>
              <ul className="nav-menu">
                <li className="nav-item">
                  <span className="nav-icon">➕</span>
                  <span className="nav-text">Add User</span>
                </li>
                <li className="nav-item">
                  <span className="nav-icon">📈</span>
                  <span className="nav-text">Analytics</span>
                </li>
                <li className="nav-item">
                  <span className="nav-icon">🔐</span>
                  <span className="nav-text">Permissions</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="main-content">
          {/* Welcome Section */}
          <section className="welcome-section animate-fade-in">
            <div className="welcome-content">
              <h1 className="welcome-title">
                  Welcome back 
                  <br />
                <span className="highlight">{user.fullName}</span> 👋
              </h1>
              <p className="welcome-subtitle">
                  Here's what's happening in your account today.
              </p>
            </div>
          </section>


          {/* Stats Cards */}
          <section className="stats-section animate-fade-in">
            <div className="stats-grid">
              <div className="stat-card card">
                <div className="stat-icon">{getStatIcon('users')}</div>
                <div className="stat-content">
                  <h3 className="stat-title">Total Users</h3>
                  <p className="stat-number">{users.length}</p>
                  <p className="stat-change positive">+12% from last month</p>
                </div>
              </div>
              
              <div className="stat-card card">
                <div className="stat-icon">{getStatIcon('active')}</div>
                <div className="stat-content">
                  <h3 className="stat-title">Active Users</h3>
                  <p className="stat-number">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                  <p className="stat-change positive">+8% from last month</p>
                </div>
              </div>
              
              <div className="stat-card card">
                <div className="stat-icon">{getStatIcon('admins')}</div>
                <div className="stat-content">
                  <h3 className="stat-title">Admins</h3>
                  <p className="stat-number">
                    {users.filter(u => u.role === 'admin').length}
                  </p>
                  <p className="stat-change neutral">No change</p>
                </div>
              </div>
              
              <div className="stat-card card">
                <div className="stat-icon">{getStatIcon('staff')}</div>
                <div className="stat-content">
                  <h3 className="stat-title">Staff</h3>
                  <p className="stat-number">
                    {users.filter(u => u.role === 'staff').length}
                  </p>
                  <p className="stat-change positive">+15% from last month</p>
                </div>
              </div>
            </div>
          </section>

          {/* Users Table (Admin Only) */}
          {isAdmin && (
            <section className="users-section animate-fade-in">
              <div className="section-header">
                <h2 className="section-title">User Management</h2>
                <button 
                  onClick={fetchUsers} 
                  className="btn btn-secondary refresh-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="refresh-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="23,4 23,10 17,10" />
                        <polyline points="1,20 1,14 7,14" />
                        <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
              </div>
              <div className="table-controls card">
                <div className="control">
                  <label htmlFor="search">Search</label>
                  <input
                    id="search"
                    type="text"
                    placeholder="Search name, email, position..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="control">
                  <label htmlFor="statusFilter">Status</label>
                  <select id="statusFilter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="control">
                  <label htmlFor="roleFilter">Role</label>
                  <select id="roleFilter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div className="control">
                  <label htmlFor="sortBy">Sort by</label>
                  <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="fullName">Name</option>
                    <option value="createdAt">Created At</option>
                    <option value="updatedAt">Updated At</option>
                  </select>
                </div>
                <div className="control">
                  <label htmlFor="sortOrder">Order</label>
                  <select id="sortOrder" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading users...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <p>{error}</p>
                </div>
              ) : (
                <div className="users-table-container card">
                  <div className="table-header">
                    <h3>All Users ({getDerivedUsers().length})</h3>
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
                          {getRoleBadge(user.role)}
                        </div>
                        <div className="table-cell">
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="table-cell">
                          <span className="user-created">
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Staff Dashboard */}
          {isStaff && !isAdmin && (
            <section className="staff-section animate-fade-in">
              <div className="staff-dashboard card">
                <div className="card-header">
                  <h2>Staff Dashboard</h2>
                </div>
                <div className="card-body">
                  <p className="staff-welcome">
                    Welcome to your staff dashboard. You have limited access to user management features.
                  </p>
                  <div className="staff-info">
                    <h3>Your Information</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Name:</span>
                        <span className="info-value">{user.fullName}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Position:</span>
                        <span className="info-value">{user.position}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Role:</span>
                        <span className="info-value">{getRoleBadge(user.role)}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Status:</span>
                        <span className="info-value">{getStatusBadge(user.status)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
