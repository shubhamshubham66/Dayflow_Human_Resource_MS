/**
 * Validation rule factories for form validation.
 * Each returns a function that takes a value and returns an error message or empty string.
 */

export const required = (fieldName) => (value) => {
  if (!value || !value.toString().trim()) {
    return `${fieldName} is required`;
  }
  return '';
};

export const minLength = (fieldName, min) => (value) => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters`;
  }
  return '';
};

export const maxLength = (fieldName, max) => (value) => {
  if (value && value.length > max) {
    return `${fieldName} cannot exceed ${max} characters`;
  }
  return '';
};

export const isEmail = () => (value) => {
  if (value && !/^\S+@\S+\.\S+$/.test(value)) {
    return 'Please enter a valid email address';
  }
  return '';
};

/**
 * Password validation:
 * - Min 8 characters
 * - At least 1 number
 * - At least 1 special character
 */
export const isStrongPassword = () => (value) => {
  if (!value) return '';
  if (value.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/\d/.test(value)) {
    return 'Password must contain at least 1 number';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return 'Password must contain at least 1 special character';
  }
  return '';
};

/**
 * Confirm password validation
 */
export const matchesField = (fieldName, matchFieldName) => (value, allValues) => {
  if (value && value !== allValues[matchFieldName]) {
    return `${fieldName} do not match`;
  }
  return '';
};

/**
 * Employee ID format validation
 */
export const isValidEmployeeId = () => (value) => {
  if (value && !/^[A-Za-z0-9-]+$/.test(value)) {
    return 'Employee ID can only contain letters, numbers, and hyphens';
  }
  return '';
};
