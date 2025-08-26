import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import './Login.css';

const Login = () => {
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoginError('');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo credentials
  const demoCredentials = [
    { email: 'an.nguyen@example.com', password: 'hashed_password_123', role: 'Admin' },
    { email: 'binh.tran@example.com', password: 'hashed_password_456', role: 'Staff' }
  ];

  const handleDemoCredential = useCallback((credential) => {
    setFormData({
      email: credential.email,
      password: credential.password
    });
    setErrors({});
    setLoginError('');
  }, []);

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className="login-content">
        <div className="login-header">
          <ThemeToggle className="login-theme-toggle" />
        </div>
        
        <div className="login-card card animate-fade-in">
          <div className="login-card-header">
            <div className="logo">
              <div className="logo-icon">🚀</div>
              <h1 className="logo-text">Welcome Back</h1>
            </div>
            
            <p className="login-subtitle">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <div className="input-wrapper">
                
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="input-wrapper">
                
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {loginError && (
              <div className="error-alert">
                <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary login-button"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="login-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10,17 15,12 10,7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="demo-credentials">
            <h3 className="demo-title">Demo Credentials</h3>
            <p className="demo-subtitle">Click to fill the form with demo data</p>
            <div className="credential-buttons">
              {demoCredentials.map((cred, index) => (
                <button
                  key={index}
                  onClick={() => handleDemoCredential(cred)}
                  className="btn btn-ghost demo-button"
                  type="button"
                  disabled={isLoading}
                >
                  <span className="demo-role">{cred.role}</span>
                  <span className="demo-email">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="register-link">
            <p className="register-text">
              Don't have an account? 
              <button 
                onClick={() => navigate('/register')} 
                className="link-button"
                disabled={isLoading}
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
