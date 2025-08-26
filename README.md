# Authentication & Authorization System

Hệ thống Authentication và Authorization hoàn chỉnh với JWT, Role-based Access Control, và tích hợp MockAPI.

## 🚀 Tính năng

### Authentication
- ✅ **Login/Logout**: UI đẹp với form validation
- ✅ **User Registration**: Đăng ký tài khoản mới với validation
- ✅ **JWT Authentication**: Token-based authentication
- ✅ **Password Hashing**: bcryptjs mã hóa mật khẩu
- ✅ **Auto-login**: Lưu token trong localStorage
- ✅ **Token Validation**: Kiểm tra token khi refresh page

### Authorization
- ✅ **Role-based Access Control**: Phân quyền Admin/Staff
- ✅ **Protected Routes**: Bảo vệ routes theo role
- ✅ **Dynamic Navigation**: Menu thay đổi theo quyền
- ✅ **Access Control**: Kiểm tra quyền khi CRUD operations

### Frontend
- ✅ **React 19**: Sử dụng React hooks và context
- ✅ **Responsive Design**: UI đẹp và mobile-friendly
- ✅ **Form Validation**: Client-side validation
- ✅ **Error Handling**: Xử lý lỗi gracefully
- ✅ **Registration Form**: Form đăng ký với validation

### Backend
- ✅ **Express Server**: RESTful API với middleware
- ✅ **JWT Middleware**: Kiểm tra và validate tokens
- ✅ **Role Middleware**: Kiểm tra quyền truy cập
- ✅ **MockAPI Integration**: Tích hợp với external API
- ✅ **Password Security**: bcryptjs hash và verify
- ✅ **User Registration**: API đăng ký với validation

## 🛠️ Cài đặt

### Prerequisites
- Node.js (v16+)
- npm hoặc yarn

### Installation
```bash
# Clone repository
git clone <repository-url>
cd mock_project_group4

# Cài đặt dependencies
npm install

# Cài đặt dev dependencies
npm install concurrently --save-dev
```

## 🚀 Chạy ứng dụng

### Development Mode (Frontend + Backend)
```bash
# Chạy cả frontend và backend
npm run dev
```

### Chạy riêng lẻ
```bash
# Chạy backend server
npm run server

# Chạy frontend (trong terminal khác)
npm start
```

### Production Build
```bash
npm run build
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MockAPI**: https://68911551944bf437b59833cb.mockapi.io/users

## 🔐 Demo Credentials

### Admin Users
```
Email: an.nguyen@example.com
Password: hashed_password_123

Email: dung.pham@example.com
Password: hashed_password_321

Email: h.tran@example.com
Password: hashed_password_753
```

### Staff Users
```
Email: binh.tran@example.com
Password: hashed_password_456

Email: em.dang@example.com
Password: hashed_password_654

Email: g.nguyen@example.com
Password: hashed_password_159
```

## 📁 Cấu trúc dự án

```
mock_project_group4/
├── server.js                 # Backend Express server
├── src/
│   ├── components/
│   │   ├── Login.js         # Login component
│   │   ├── Login.css        # Login styles
│   │   ├── Register.js      # Register component
│   │   ├── Register.css     # Register styles
│   │   ├── Dashboard.js     # Dashboard component
│   │   ├── Dashboard.css    # Dashboard styles
│   │   ├── ProtectedRoute.js # Route protection
│   │   └── Home.js          # Home component
│   ├── contexts/
│   │   └── AuthContext.js   # Authentication context
│   ├── App.js               # Main app component
│   ├── App.css              # Global styles
│   └── index.js             # Entry point
├── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin user hiện tại

### Users (Admin Only)
- `GET /api/users` - Lấy danh sách users
- `GET /api/users/:id` - Lấy user theo ID
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

### Health Check
- `GET /api/health` - Kiểm tra server status

## 🎯 Role-based Access

### Admin Role
- ✅ Truy cập tất cả features
- ✅ Quản lý users (CRUD)
- ✅ Xem thống kê tổng quan
- ✅ Truy cập admin tools
- ✅ Tạo tài khoản mới

### Staff Role
- ✅ Truy cập dashboard cơ bản
- ✅ Xem thông tin cá nhân
- ✅ Truy cập reports (nếu có)
- ❌ Không thể quản lý users

## 🔒 Security Features

- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcryptjs với salt rounds 12
- **CORS Protection**: Cross-origin resource sharing
- **Input Validation**: Client và server-side validation
- **Role Verification**: Middleware kiểm tra quyền truy cập
- **Email Uniqueness**: Kiểm tra email trùng lặp khi đăng ký

## 🎨 UI/UX Features

- **Modern Design**: Gradient backgrounds, shadows, animations
- **Responsive Layout**: Mobile-first approach
- **Interactive Elements**: Hover effects, transitions
- **Loading States**: Spinners và loading indicators
- **Error Handling**: User-friendly error messages
- **Form Validation**: Real-time validation feedback

## 🚀 Deployment

### Backend
```bash
# Set environment variables
export PORT=5000
export JWT_SECRET=your-secret-key

# Start server
npm run server
```

### Frontend
```bash
# Build production
npm run build

# Serve static files
npx serve -s build
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📝 Notes

- **MockAPI**: Sử dụng external API để demo
- **Password Security**: bcryptjs hash với salt rounds 12
- **JWT Secret**: Thay đổi trong production
- **CORS**: Cấu hình cho development
- **Registration**: Tự động tạo JWT token sau khi đăng ký

## 🔐 Password Security

### Hashing Algorithm
- **bcryptjs**: Sử dụng salt rounds 12
- **Salt**: Tự động tạo salt unique cho mỗi password
- **Verification**: So sánh password với hash đã lưu

### Security Features
- **Brute Force Protection**: Salt rounds làm chậm brute force attacks
- **Rainbow Table Protection**: Salt unique cho mỗi password
- **Industry Standard**: bcrypt là industry standard cho password hashing

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Support

Nếu có vấn đề, vui lòng tạo issue hoặc liên hệ team development.
