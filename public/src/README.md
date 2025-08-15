# 🚀 **FPT Frontend - Code Structure Documentation**

## 📁 **Project Structure**

```
public/src/
├── components/           # React Components
│   ├── common/          # Reusable UI Components
│   │   ├── Button.js    # Button component with variants
│   │   ├── Button.css   # Button styles
│   │   ├── Modal.js     # Modal component
│   │   ├── Modal.css    # Modal styles
│   │   ├── Form.js      # Form components (Input, Select, etc.)
│   │   ├── Form.css     # Form styles
│   │   └── index.js     # Export all common components
│   ├── Dashboard.js     # Main dashboard
│   ├── Profile.js       # User profile management
│   ├── UserManagement.js # Admin user management
│   ├── Login.js         # Authentication
│   ├── Register.js      # User registration
│   ├── ChangePassword.js # Password change
│   ├── ProtectedRoute.js # Route protection
│   └── Home.js          # Landing page
├── contexts/            # React Context
│   └── AuthContext.js   # Authentication & user management
├── hooks/               # Custom React Hooks
│   ├── useForm.js       # Form state management
│   └── useModal.js      # Modal state management
├── utils/               # Utility Functions
│   └── index.js         # Common utilities
├── constants/           # Application Constants
│   └── index.js         # All constants & configurations
├── App.js               # Main application component
├── App.css              # Global styles
└── index.js             # Application entry point
```

## 🎯 **Key Features**

### **1. Modular Architecture**
- **Separation of Concerns**: Each component has a single responsibility
- **Reusable Components**: Common UI elements can be used across the app
- **Custom Hooks**: Logic is separated from UI components
- **Utility Functions**: Common operations are centralized

### **2. Component Organization**
- **Common Components**: Reusable UI elements (Button, Modal, Form)
- **Page Components**: Main application pages
- **Layout Components**: Structure and navigation components

### **3. State Management**
- **React Context**: Global state for authentication and user data
- **Custom Hooks**: Local state management for forms and modals
- **Local Storage**: Persistent data storage

## 🛠️ **Common Components Usage**

### **Button Component**
```jsx
import { Button } from '../components/common';

// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variants
<Button variant="success" size="large" icon="✅">
  Success Button
</Button>

// Loading state
<Button loading={true}>Processing...</Button>
```

**Available Variants**: `primary`, `secondary`, `success`, `danger`, `warning`, `outline`, `ghost`
**Available Sizes**: `small`, `medium`, `large`

### **Modal Component**
```jsx
import { Modal } from '../components/common';

<Modal 
  isOpen={isModalOpen} 
  onClose={closeModal}
  title="User Details"
  size="medium"
>
  <div>Modal content here</div>
</Modal>
```

**Available Sizes**: `small`, `medium`, `large`, `full`

### **Form Components**
```jsx
import { 
  Form, 
  FormGroup, 
  Input, 
  Select, 
  FormRow 
} from '../components/common';

<Form onSubmit={handleSubmit}>
  <FormGroup label="Full Name" required>
    <Input 
      name="fullName" 
      value={formData.fullName}
      onChange={handleChange}
      placeholder="Enter your name"
    />
  </FormGroup>
  
  <FormRow>
    <FormGroup label="Role">
      <Select name="role" value={formData.role} onChange={handleChange}>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </Select>
    </FormGroup>
  </FormRow>
</Form>
```

## 🎣 **Custom Hooks Usage**

### **useForm Hook**
```jsx
import { useForm } from '../hooks/useForm';

const { 
  values, 
  errors, 
  handleChange, 
  validate, 
  reset 
} = useForm(initialValues);

// Validation
const validationRules = {
  email: {
    required: 'Email is required',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    patternMessage: 'Invalid email format'
  }
};

const isValid = validate(validationRules);
```

### **useModal Hook**
```jsx
import { useModal } from '../hooks/useModal';

const { isOpen, open, close } = useModal();

// Open modal with data
open({ userId: 123, userName: 'John' });

// Close modal
close();
```

## 🔧 **Utility Functions**

### **Date Formatting**
```jsx
import { formatDate, formatDateTime } from '../utils';

formatDate('2024-01-15'); // Jan 15, 2024
formatDateTime('2024-01-15T10:30:00Z'); // 1/15/2024, 10:30:00 AM
```

### **String Utilities**
```jsx
import { getInitials, truncateText } from '../utils';

getInitials('John Doe', 'john@example.com'); // 'J'
truncateText('Very long text that needs truncation', 20); // 'Very long text...'
```

### **Validation**
```jsx
import { validateEmail, validatePassword } from '../utils';

validateEmail('test@example.com'); // true
validatePassword('123456'); // true
```

## 📊 **Constants Usage**

### **API Configuration**
```jsx
import { API_CONFIG, USER_ROLES, ROUTES } from '../constants';

// API calls
fetch(`${API_CONFIG.MOCK_API_URL}/users`);

// Role checking
if (user.role === USER_ROLES.ADMIN) {
  // Admin only code
}

// Navigation
navigate(ROUTES.USER_MANAGEMENT);
```

### **Messages**
```jsx
import { MESSAGES } from '../constants';

setMessage({ 
  type: 'success', 
  text: MESSAGES.SUCCESS.USER_CREATED 
});
```

## 🎨 **Styling Guidelines**

### **CSS Classes**
- **BEM Methodology**: Block__Element--Modifier
- **Responsive Design**: Mobile-first approach
- **CSS Variables**: Consistent color scheme and spacing
- **Animations**: Smooth transitions and hover effects

### **Responsive Breakpoints**
```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (max-width: 1200px) { }
```

## 🚀 **Best Practices**

### **1. Component Structure**
```jsx
// ✅ Good: Single responsibility
const UserCard = ({ user, onEdit, onDelete }) => {
  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div className="user-card__actions">
        <Button onClick={() => onEdit(user)}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(user.id)}>Delete</Button>
      </div>
    </div>
  );
};

// ❌ Bad: Multiple responsibilities
const UserCard = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  // ... too many responsibilities
};
```

### **2. Hook Usage**
```jsx
// ✅ Good: Custom hook for form logic
const { values, handleChange, validate } = useForm(initialValues);

// ❌ Bad: Inline form state
const [formData, setFormData] = useState({});
const [errors, setErrors] = useState({});
// ... repetitive code
```

### **3. Error Handling**
```jsx
// ✅ Good: Centralized error handling
import { handleApiError } from '../utils';

try {
  const result = await apiCall();
} catch (error) {
  const errorMessage = handleApiError(error, 'Default error message');
  setError(errorMessage);
}

// ❌ Bad: Inline error handling
try {
  const result = await apiCall();
} catch (error) {
  if (error.response?.data?.message) {
    setError(error.response.data.message);
  } else if (error.message) {
    setError(error.message);
  } else {
    setError('An error occurred');
  }
}
```

## 📝 **Adding New Components**

### **1. Create Component File**
```jsx
// components/common/NewComponent.js
import React from 'react';
import './NewComponent.css';

const NewComponent = ({ children, ...props }) => {
  return (
    <div className="new-component" {...props}>
      {children}
    </div>
  );
};

export default NewComponent;
```

### **2. Create CSS File**
```css
/* components/common/NewComponent.css */
.new-component {
  /* Base styles */
}

.new-component--variant {
  /* Variant styles */
}

@media (max-width: 768px) {
  /* Responsive styles */
}
```

### **3. Export from Index**
```jsx
// components/common/index.js
export { default as NewComponent } from './NewComponent';
```

### **4. Import and Use**
```jsx
import { NewComponent } from '../components/common';

<NewComponent>Content</NewComponent>
```

## 🔍 **Debugging Tips**

### **1. Console Logging**
```jsx
import { API_CONFIG } from '../constants';

console.log('API URL:', API_CONFIG.MOCK_API_URL);
console.log('Current user:', user);
console.log('Form data:', formData);
```

### **2. React DevTools**
- Use React DevTools browser extension
- Inspect component hierarchy and props
- Monitor state changes

### **3. Network Tab**
- Check API calls in browser DevTools
- Verify request/response data
- Monitor error responses

## 📚 **Additional Resources**

- **React Documentation**: https://reactjs.org/docs/
- **CSS BEM Methodology**: https://en.bem.info/methodology/
- **JavaScript ES6+ Features**: https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **Responsive Design**: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design

---

## 🎉 **Getting Started**

1. **Explore the structure**: Navigate through the folders to understand the organization
2. **Review components**: Look at existing components to see patterns
3. **Use common components**: Start with Button, Modal, and Form components
4. **Follow patterns**: Use the established patterns for new features
5. **Ask questions**: Don't hesitate to ask about any unclear patterns

**Happy Coding! 🚀**
