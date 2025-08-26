// API Configuration
export const API_CONFIG = {
  MOCK_API_URL: 'https://68911551944bf437b59833cb.mockapi.io/users',
  LOCAL_API_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
};

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  CHANGE_PASSWORD: '/change-password',
  USER_MANAGEMENT: '/user-management',
  ADMIN: '/admin',
  STAFF: '/staff',
};

// Form Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

// UI Constants
export const UI = {
  MODAL_Z_INDEX: 1000,
  ANIMATION_DURATION: 200,
  MAX_TABLE_HEIGHT: 300,
  RESPONSIVE_BREAKPOINTS: {
    MOBILE: 480,
    TABLET: 768,
    DESKTOP: 1200,
  },
};

// Messages
export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'User created successfully!',
    USER_UPDATED: 'User updated successfully!',
    USER_DELETED: 'User deleted successfully!',
    PROFILE_UPDATED: 'Profile updated successfully! Your changes have been saved.',
    PROFILE_RESET: 'Profile reset to original successfully!',
    USER_SWITCHED: 'Switched to user successfully!',
  },
  ERROR: {
    ACCESS_DENIED: 'You need admin privileges to access this page.',
    USER_CREATE_FAILED: 'Failed to create user. Please try again.',
    USER_UPDATE_FAILED: 'Failed to update user. Please try again.',
    USER_DELETE_FAILED: 'Failed to delete user. Please try again.',
    PROFILE_UPDATE_FAILED: 'Failed to update profile. Please try again.',
    PROFILE_RESET_FAILED: 'Failed to reset profile.',
    USER_SWITCH_FAILED: 'Failed to switch user.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
  },
  WARNING: {
    DELETE_CONFIRMATION: 'Are you sure you want to delete this user?',
    DELETE_WARNING: 'This action cannot be undone. All user data will be permanently deleted.',
  },
};

// Table Columns
export const TABLE_COLUMNS = {
  USERS: [
    { key: 'avatar', label: 'Avatar', width: '60px' },
    { key: 'name', label: 'Name', width: '1fr' },
    { key: 'email', label: 'Email', width: '1.5fr' },
    { key: 'position', label: 'Position', width: '1fr' },
    { key: 'role', label: 'Role', width: '100px' },
    { key: 'status', label: 'Status', width: '100px' },
    { key: 'created', label: 'Created', width: '120px' },
    { key: 'actions', label: 'Actions', width: '120px' },
  ],
};

// Default Form Values
export const DEFAULT_FORM_VALUES = {
  USER: {
    fullName: '',
    email: '',
    password: '',
    role: USER_ROLES.STAFF,
    position: '',
    status: USER_STATUS.ACTIVE,
  },
  PROFILE: {
    fullName: '',
    email: '',
    position: '',
    phone: '',
    address: '',
    bio: '',
  },
};
