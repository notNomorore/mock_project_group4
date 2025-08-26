const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
// Static serving for uploaded files
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});
const upload = multer({ storage });

// MockAPI URL
const MOCK_API_URL = 'https://68911551944bf437b59833cb.mockapi.io/users';

// JWT Middleware để kiểm tra token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Support app's mock token format: mock_token_{id}_{timestamp}
  if (token.startsWith('mock_token_')) {
    try {
      const parts = token.split('_');
      const userId = parts[2];
      if (!userId) {
        return res.status(403).json({ message: 'Invalid mock token' });
      }
      const mockRes = await axios.get(`${MOCK_API_URL}/${userId}`);
      const u = mockRes.data;
      req.user = {
        id: String(u.id),
        email: u.email,
        role: u.role,
        fullName: u.fullName,
        position: u.position
      };
      return next();
    } catch (e) {
      console.error('Mock token resolve failed:', e?.message || e);
      return res.status(403).json({ message: 'Invalid mock token' });
    }
  }

  // Otherwise require real JWT
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

// In-memory stores (demo)
let projects = [];
let tasks = [];
let filesMeta = [];

// Helpers
const isAdminUser = (req) => req.user?.role === 'admin';
const isStaffUser = (req) => req.user?.role === 'staff';

const findProjectById = (id) => projects.find(p => p.id === id);
const findTaskById = (id) => tasks.find(t => t.id === id);

const generateId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

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

// ===== Files (Shared documents) =====
// Upload file (Admin and Staff)
app.post('/api/files/upload', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const { originalname, filename, size } = req.file;
    const { isPublic = 'true', description = '' } = req.body;
    const absoluteUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
    const fileRecord = {
      id: generateId(),
      originalName: originalname,
      fileName: filename,
      size,
      url: absoluteUrl,
      description,
      isPublic: String(isPublic) === 'true',
      uploadedBy: req.user.id,
      uploadedByRole: req.user.role,
      uploadedAt: new Date().toISOString(),
    };
    filesMeta.unshift(fileRecord);
    res.status(201).json(fileRecord);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
});

// List files (both can view; staff only sees public + their uploads)
app.get('/api/files', authenticateToken, (req, res) => {
  if (isAdminUser(req)) {
    return res.json(filesMeta);
  }
  const visible = filesMeta.filter(f => f.isPublic || f.uploadedBy === req.user.id);
  res.json(visible);
});

// Delete file (Admin or owner)
app.delete('/api/files/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const idx = filesMeta.findIndex(f => f.id === id);
  if (idx === -1) return res.status(404).json({ message: 'File not found' });
  const record = filesMeta[idx];
  if (!isAdminUser(req) && record.uploadedBy !== req.user.id) {
    return res.status(403).json({ message: 'Not allowed to delete this file' });
  }
  // Attempt remove file from disk
  try {
    fs.unlinkSync(path.join(UPLOADS_DIR, record.fileName));
  } catch (_) {}
  filesMeta.splice(idx, 1);
  res.json({ message: 'File deleted' });
});

// ===== Projects =====
// Create project (Admin only)
app.post('/api/projects', authenticateToken, requireAdmin, (req, res) => {
  const { name, description = '', memberIds = [] } = req.body;
  if (!name) return res.status(400).json({ message: 'Project name is required' });
  const normalizedMembers = Array.isArray(memberIds) ? memberIds.map(String) : [];
  const project = {
    id: generateId(),
    name: name.trim(),
    description,
    memberIds: normalizedMembers,
    createdBy: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.unshift(project);
  res.status(201).json(project);
});

// List projects (both roles)
app.get('/api/projects', authenticateToken, (req, res) => {
  res.json(projects);
});

// Get project
app.get('/api/projects/:id', authenticateToken, (req, res) => {
  const project = findProjectById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  res.json(project);
});

// Update project (Admin only)
app.put('/api/projects/:id', authenticateToken, requireAdmin, (req, res) => {
  const project = findProjectById(req.params.id);
  if (!project) return res.status(404).json({ message: 'Project not found' });
  const { name, description, memberIds } = req.body;
  if (name) project.name = String(name).trim();
  if (description !== undefined) project.description = description;
  if (memberIds !== undefined) {
    project.memberIds = Array.isArray(memberIds) ? memberIds.map(String) : [];
  }
  project.updatedAt = new Date().toISOString();
  res.json(project);
});

// Delete project (Admin only)
app.delete('/api/projects/:id', authenticateToken, requireAdmin, (req, res) => {
  const idx = projects.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Project not found' });
  const projectId = projects[idx].id;
  projects.splice(idx, 1);
  // Cascade delete tasks under project
  tasks = tasks.filter(t => t.projectId !== projectId);
  res.json({ message: 'Project deleted' });
});

// ===== Tasks =====
// Create task (Admin or Staff; staff can only assign to self)
app.post('/api/tasks', authenticateToken, (req, res) => {
  const {
    title,
    description = '',
    status = 'pending',
    priority = 'medium',
    deadline = null,
    assigneeId,
    projectId = null,
    attachments = []
  } = req.body;
  if (!title) return res.status(400).json({ message: 'Task title is required' });

  let finalAssigneeId = assigneeId;
  if (isStaffUser(req)) {
    // staff can only create for themselves
    finalAssigneeId = req.user.id;
  }

  if (projectId && !findProjectById(projectId)) {
    return res.status(400).json({ message: 'Invalid projectId' });
  }

  const allowedStatuses = ['pending', 'in_progress', 'done'];
  const allowedPriorities = ['low', 'medium', 'high'];
  const finalStatus = allowedStatuses.includes(status) ? status : 'pending';
  const finalPriority = allowedPriorities.includes(priority) ? priority : 'medium';

  const task = {
    id: generateId(),
    title: title.trim(),
    description,
    status: finalStatus,
    priority: finalPriority,
    deadline: deadline || null,
    assigneeId: String(finalAssigneeId),
    projectId: projectId ? String(projectId) : null,
    attachments,
    createdById: req.user.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.unshift(task);
  res.status(201).json(task);
});

// List tasks
// Admin: all tasks; Staff: only their tasks
app.get('/api/tasks', authenticateToken, (req, res) => {
  if (isAdminUser(req)) return res.json(tasks);
  const mine = tasks.filter(t => t.assigneeId === String(req.user.id));
  res.json(mine);
});

// Get task
app.get('/api/tasks/:id', authenticateToken, (req, res) => {
  const task = findTaskById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!isAdminUser(req) && task.assigneeId !== String(req.user.id)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  res.json(task);
});

// Update task
// Admin can update any; Staff only if assigneeId == self, and cannot reassign to others
app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const task = findTaskById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });

  if (isStaffUser(req) && task.assigneeId !== String(req.user.id)) {
    return res.status(403).json({ message: 'Staff cannot modify others\' tasks' });
  }

  const { title, description, status, assigneeId, projectId, attachments, deadline, priority } = req.body;
  if (title !== undefined) task.title = String(title).trim();
  if (description !== undefined) task.description = description;
  if (status !== undefined) {
    const allowedStatuses = ['pending', 'in_progress', 'done'];
    task.status = allowedStatuses.includes(status) ? status : task.status;
  }

  if (assigneeId !== undefined) {
    if (isAdminUser(req)) {
      task.assigneeId = String(assigneeId);
    } else {
      // staff cannot reassign to others
      task.assigneeId = String(req.user.id);
    }
  }

  if (projectId !== undefined) {
    if (projectId && !findProjectById(projectId)) {
      return res.status(400).json({ message: 'Invalid projectId' });
    }
    task.projectId = projectId ? String(projectId) : null;
  }

  if (attachments !== undefined) task.attachments = attachments;
  if (deadline !== undefined) task.deadline = deadline || null;
  if (priority !== undefined) {
    const allowedPriorities = ['low', 'medium', 'high'];
    if (allowedPriorities.includes(priority)) task.priority = priority;
  }

  task.updatedAt = new Date().toISOString();
  res.json(task);
});

// Delete task
// Now: Admin only (staff cannot delete)
app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  if (!isAdminUser(req)) {
    return res.status(403).json({ message: 'Only admin can delete tasks' });
  }
  const idx = tasks.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Task not found' });
  tasks.splice(idx, 1);
  res.json({ message: 'Task deleted' });
});

// Upload attachment for a task (Admin or Staff owner)
app.post('/api/tasks/:id/attachments', authenticateToken, upload.single('file'), (req, res) => {
  const task = findTaskById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!isAdminUser(req) && task.assigneeId !== String(req.user.id)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const { originalname, filename, size } = req.file;
  const absoluteUrl = `${req.protocol}://${req.get('host')}/uploads/${filename}`;
  const attachment = {
    id: generateId(),
    originalName: originalname,
    fileName: filename,
    size,
    url: absoluteUrl,
    uploadedAt: new Date().toISOString(),
    uploadedBy: req.user.id,
  };
  if (!Array.isArray(task.attachments)) task.attachments = [];
  task.attachments.unshift(attachment);
  task.updatedAt = new Date().toISOString();
  res.status(201).json(task);
});

// Delete attachment from a task (Admin or Staff owner)
app.delete('/api/tasks/:id/attachments/:attachmentId', authenticateToken, (req, res) => {
  const task = findTaskById(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (!isAdminUser(req) && task.assigneeId !== String(req.user.id)) {
    return res.status(403).json({ message: 'Not allowed' });
  }
  const idx = (task.attachments || []).findIndex(a => a.id === req.params.attachmentId);
  if (idx === -1) return res.status(404).json({ message: 'Attachment not found' });
  const record = task.attachments[idx];
  try {
    fs.unlinkSync(path.join(UPLOADS_DIR, record.fileName));
  } catch (_) {}
  task.attachments.splice(idx, 1);
  task.updatedAt = new Date().toISOString();
  res.json(task);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
