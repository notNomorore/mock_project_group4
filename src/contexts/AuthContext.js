import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // MockAPI endpoint
  const MOCK_API_URL = 'https://68911551944bf437b59833cb.mockapi.io/users';
  
  // State for users list
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(1); // Default to first user

  // Cấu hình axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Fetch users from MockAPI
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(MOCK_API_URL);
        setUsers(response.data);
        console.log('Users fetched from MockAPI:', response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Kiểm tra token khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          // Lấy user ID từ localStorage nếu có
          const currentUserId = localStorage.getItem('currentUserId');
          const userIdToUse = currentUserId ? parseInt(currentUserId) : selectedUserId;
          
          // Use MockAPI to get user data based on current user ID
          const response = await axios.get(`${MOCK_API_URL}/${userIdToUse}`);
          const userData = response.data;
          
          // Cập nhật selectedUserId để đồng bộ
          setSelectedUserId(userIdToUse);
          
          setUser({
            id: userData.id,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            fullName: userData.fullName,
            position: userData.position,
            avatar: userData.avatar,
            attachments: userData.attachments,
            createdAt: userData.createdAt,
            updatedAt: userData.updatedAt
          });
          
          console.log('Auth check successful for user:', userData);
        } catch (error) {
          console.error('Token validation failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      // Tìm user trong MockAPI dựa trên email
      const usersResponse = await axios.get(MOCK_API_URL);
      const allUsers = usersResponse.data;
      
      // Tìm user có email và password khớp
      const foundUser = allUsers.find(user => 
        user.email === email && user.password === password
      );
      
      if (foundUser) {
        // Kiểm tra status của user
        if (foundUser.status === 'inactive') {
          return { 
            success: false, 
            message: 'Tài khoản đã bị khóa. Vui lòng liên hệ admin để kích hoạt.' 
          };
        }
        
        // Tạo token giả (vì MockAPI không có authentication)
        const fakeToken = `mock_token_${foundUser.id}_${Date.now()}`;
        
        setToken(fakeToken);
        setUser({
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role,
          status: foundUser.status,
          fullName: foundUser.fullName,
          position: foundUser.position,
          avatar: foundUser.avatar,
          attachments: foundUser.attachments,
          createdAt: foundUser.createdAt,
          updatedAt: foundUser.updatedAt
        });
        
        // Cập nhật selectedUserId để tránh bị reset về user cũ
        setSelectedUserId(foundUser.id);
        
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('currentUserId', foundUser.id.toString());
        
        console.log('Login successful:', foundUser);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: 'Email hoặc mật khẩu không đúng' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'Đăng nhập thất bại. Vui lòng thử lại.' 
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSelectedUserId(1); // Reset về user đầu tiên
    localStorage.removeItem('token');
    localStorage.removeItem('currentUserId');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      // Update profile using MockAPI
      const response = await axios.put(`${MOCK_API_URL}/${user.id}`, {
        ...user,
        ...profileData,
        updatedAt: new Date().toISOString()
      });
      
      if (response.data) {
        // Update user state with new profile data
        const updatedUser = { ...user, ...profileData, updatedAt: response.data.updatedAt };
        setUser(updatedUser);
        
        console.log('Profile updated via MockAPI:', response.data);
        console.log('User state updated:', updatedUser);
        
        return { success: true };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  };

  const resetMockProfile = async () => {
    try {
      // Get original user data from MockAPI
      const response = await axios.get(`${MOCK_API_URL}/${user.id}`);
      const originalData = response.data;
      
      // Reset to original data
      const resetData = {
        fullName: originalData.fullName,
        email: originalData.email,
        position: originalData.position,
        role: originalData.role,
        status: originalData.status,
        avatar: originalData.avatar,
        attachments: originalData.attachments,
        updatedAt: new Date().toISOString()
      };
      
      const updateResponse = await axios.put(`${MOCK_API_URL}/${user.id}`, resetData);
      
      if (updateResponse.data) {
        // Update user state with reset data
        const updatedUser = { ...user, ...resetData, updatedAt: updateResponse.data.updatedAt };
        setUser(updatedUser);
        
        console.log('Profile reset to original via MockAPI:', updateResponse.data);
        return { success: true };
      }
    } catch (error) {
      console.error('Profile reset error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to reset profile' 
      };
    }
  };

  const changeSelectedUser = async (userId) => {
    try {
      setSelectedUserId(userId);
      
      // Fetch new user data
      const response = await axios.get(`${MOCK_API_URL}/${userId}`);
      const userData = response.data;
      
      setUser({
        id: userData.id,
        email: userData.email,
        role: userData.role,
        status: userData.status,
        fullName: userData.fullName,
        position: userData.position,
        avatar: userData.avatar,
        attachments: userData.attachments,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      });
      
      console.log('Changed to user:', userData);
      return { success: true };
    } catch (error) {
      console.error('Error changing user:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to change user' 
      };
    }
  };

  // User Management Functions
  const createUser = async (userData) => {
    try {
      // Logic status hợp lý: User mới tạo luôn active
      const newUser = {
        ...userData,
        status: 'active', // User mới luôn active
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const response = await axios.post(MOCK_API_URL, newUser);
      
      if (response.data) {
        // Refresh users list
        const usersResponse = await axios.get(MOCK_API_URL);
        setUsers(usersResponse.data);
        
        console.log('User created:', response.data);
        
        // Tự động đăng nhập user mới tạo
        const fakeToken = `mock_token_${response.data.id}_${Date.now()}`;
        setToken(fakeToken);
        setUser({
          id: response.data.id,
          email: response.data.email,
          role: response.data.role,
          status: response.data.status,
          fullName: response.data.fullName,
          position: response.data.position,
          avatar: response.data.avatar,
          attachments: response.data.attachments,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        });
        
        // Cập nhật selectedUserId và lưu vào localStorage
        setSelectedUserId(response.data.id);
        localStorage.setItem('token', fakeToken);
        localStorage.setItem('currentUserId', response.data.id.toString());
        
        console.log('Auto-login after registration:', response.data);
        return { success: true, user: response.data };
      }
    } catch (error) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create user' 
      };
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      // Logic status hợp lý: Kiểm tra nếu user bị set inactive
      const updatedUser = {
        ...userData,
        updatedAt: new Date().toISOString()
      };
      
      const response = await axios.put(`${MOCK_API_URL}/${userId}`, updatedUser);
      
      if (response.data) {
        // Update users list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? response.data : user
          )
        );
        
        // If current user is being updated, update user state too
        if (userId === user?.id) {
          setUser(prevUser => ({ ...prevUser, ...response.data }));
          
          // Nếu user hiện tại bị set inactive, logout
          if (response.data.status === 'inactive') {
            logout();
            return { 
              success: true, 
              user: response.data, 
              message: 'Tài khoản đã bị khóa. Bạn đã được đăng xuất.' 
            };
          }
        }
        
        console.log('User updated:', response.data);
        return { success: true, user: response.data };
      }
    } catch (error) {
      console.error('Error updating user:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update user' 
      };
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`${MOCK_API_URL}/${userId}`);
      
      // Remove from users list
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      // If current user is deleted, logout
      if (userId === user?.id) {
        logout();
      }
      
      console.log('User deleted:', userId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to delete user' 
      };
    }
  };

  const refreshUsers = async () => {
    try {
      const response = await axios.get(MOCK_API_URL);
      setUsers(response.data);
      console.log('Users refreshed:', response.data);
      return { success: true };
    } catch (error) {
      console.error('Error refreshing users:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to refresh users' 
      };
    }
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userId) => {
    try {
      const currentUser = users.find(u => u.id === userId);
      if (!currentUser) {
        return { success: false, message: 'User not found' };
      }

      const newStatus = currentUser.status === 'active' ? 'inactive' : 'active';
      const updatedUser = {
        ...currentUser,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      const response = await axios.put(`${MOCK_API_URL}/${userId}`, updatedUser);
      
      if (response.data) {
        // Update users list
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? response.data : user
          )
        );
        
        // If current user is being toggled, handle logout if inactive
        if (userId === user?.id && newStatus === 'inactive') {
          logout();
          return { 
            success: true, 
            user: response.data, 
            message: 'Tài khoản đã bị khóa. Bạn đã được đăng xuất.' 
          };
        }
        
        console.log('User status toggled:', response.data);
        return { success: true, user: response.data };
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to toggle user status' 
      };
    }
  };

  const value = {
    user,
    token,
    loading,
    users,
    selectedUserId,
    login,
    logout,
    updateProfile,
    resetMockProfile,
    changeSelectedUser,
    createUser,
    updateUser,
    deleteUser,
    refreshUsers,
    toggleUserStatus,
    isAuthenticated: !!token,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
