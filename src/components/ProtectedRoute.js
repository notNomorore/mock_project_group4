import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, requireStaff = false }) => {
  const { isAuthenticated, isAdmin, isStaff, loading } = useAuth();
  const location = useLocation();

  // Hiển thị loading khi đang kiểm tra authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // Nếu chưa đăng nhập, redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền Admin nếu route yêu cầu
  if (requireAdmin && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          You don't have permission to access this page. Admin access is required.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Kiểm tra quyền Staff nếu route yêu cầu
  if (requireStaff && !isStaff && !isAdmin) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ color: '#dc3545', marginBottom: '1rem' }}>Access Denied</h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          You don't have permission to access this page. Staff or Admin access is required.
        </p>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Nếu đã đăng nhập và có đủ quyền, hiển thị children
  return children;
};

export default ProtectedRoute;
