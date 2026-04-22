// Email validation
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  return { valid: true };
};

// Phone validation
export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: true }; // Phone is optional
  }
  
  const phoneRegex = /^[\d\s\-\+\(\)]{8,20}$/;
  if (!phoneRegex.test(phone)) {
    return { valid: false, error: 'Invalid phone format' };
  }
  
  return { valid: true };
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; error?: string } => {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number' };
  }
  
  return { valid: true };
};

// Name validation
export const validateName = (name: string, fieldName: string): { valid: boolean; error?: string } => {
  if (!name) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (name.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (name.length > 100) {
    return { valid: false, error: `${fieldName} must be less than 100 characters` };
  }
  
  return { valid: true };
};

// URL validation
export const validateUrl = (url: string): { valid: boolean; error?: string } => {
  if (!url) {
    return { valid: true }; // URL is optional
  }
  
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

// Registration number validation
export const validateRegistrationNumber = (regNumber: string): { valid: boolean; error?: string } => {
  if (!regNumber) {
    return { valid: true }; // Registration number is optional
  }
  
  if (regNumber.length < 3) {
    return { valid: false, error: 'Registration number must be at least 3 characters' };
  }
  
  return { valid: true };
};

// Generic required field validation
export const validateRequired = (value: string, fieldName: string): { valid: boolean; error?: string } => {
  if (!value || value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  return { valid: true };
};
