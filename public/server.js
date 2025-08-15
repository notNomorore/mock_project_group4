const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// MockAPI URL
const MOCK_API_URL = 'https://68911551944bf437b59833cb.mockapi.io/users';

// JWT Middleware để kiểm tra token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware kiểm tra quyền Admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Middleware kiểm tra quyền Staff hoặc Admin
const requireStaffOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'staff') {
    return res.status(403).json({ message: 'Staff or Admin access required' });
  }
  next();
};

// API Routes

// Register API
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password, position, role } = req.body;

    // Validation
    if (!fullName || !email || !password || !position) {
      return res.status(400).json({ 
        message: 'All fields are required: fullName, email, password, position' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({ 
        message: 'Role must be either "admin" or "staff"' 
      });
    }

    // Kiểm tra email đã tồn tại
    try {
      const existingUsersResponse = await axios.get(MOCK_API_URL);
      const existingUsers = existingUsersResponse.data;
      const existingUser = existingUsers.find(u => u.email === email);
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Email already exists' 
        });
      }
    } catch (error) {
      console.error('Error checking existing users:', error);
      // Nếu không thể kiểm tra, vẫn cho phép đăng ký
    }

    // Hash password với bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Tạo user mới
    const newUser = {
      fullName: fullName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword, // Lưu password đã hash
      role: role,
      position: position,
      status: 'active',
      avatar: `avatar_${Date.now()}.png`,
      attachments: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      // Gửi user mới đến MockAPI
      const response = await axios.post(MOCK_API_URL, newUser);
      
      // Tạo JWT token cho user mới
      const token = jwt.sign(
        { 
          id: response.data.id, 
          email: response.data.email, 
          role: response.data.role,
          fullName: response.data.fullName,
          position: response.data.position
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: response.data.id,
          fullName: response.data.fullName,
          email: response.data.email,
          role: response.data.role,
          position: response.data.position,
          status: response.data.status
        },
        token
      });

    } catch (error) {
      console.error('Error creating user in MockAPI:', error);
      res.status(500).json({ 
        message: 'Error creating user. Please try again.' 
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Internal server error during registration' 
    });
  }
});

// Login API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Lấy danh sách users từ MockAPI
    const response = await axios.get(MOCK_API_URL);
    const users = response.data;

    // Tìm user theo email
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Kiểm tra password đã hash
    let isPasswordValid = false;
    
    // Nếu password trong MockAPI là plain text (demo), so sánh trực tiếp
    if (user.password === password) {
      isPasswordValid = true;
    } else {
      // Nếu password đã hash, sử dụng bcrypt.compare
      try {
        isPasswordValid = await bcrypt.compare(password, user.password);
      } catch (bcryptError) {
        console.error('Bcrypt comparison error:', bcryptError);
        isPasswordValid = false;
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Tạo JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        fullName: user.fullName,
        position: user.position
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        position: user.position,
        status: user.status
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Logout API (client-side sẽ xóa token)
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

// Get current user info
app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Get all users (Admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const response = await axios.get(MOCK_API_URL);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user by ID (Staff or Admin)
app.get('/api/users/:id', authenticateToken, requireStaffOrAdmin, async (req, res) => {
  try {
    const response = await axios.get(`${MOCK_API_URL}/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Create user (Admin only)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { fullName, email, password, position, role } = req.body;
    
    // Hash password nếu có
    let hashedPassword = password;
    if (password && password.length >= 6) {
      const saltRounds = 12;
      hashedPassword = await bcrypt.hash(password, saltRounds);
    }

    const userData = {
      ...req.body,
      password: hashedPassword,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const response = await axios.post(MOCK_API_URL, userData);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update user (Admin only)
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // Hash password nếu có thay đổi
    if (password && password.length >= 6) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }
    
    updateData.updatedAt = new Date().toISOString();
    
    const response = await axios.put(`${MOCK_API_URL}/${req.params.id}`, updateData);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await axios.delete(`${MOCK_API_URL}/${req.params.id}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
