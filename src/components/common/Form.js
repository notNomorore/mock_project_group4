import React from 'react';
import './Form.css';

// Form Container
export const Form = ({ children, onSubmit, className = '', ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`form ${className}`} {...props}>
      {children}
    </form>
  );
};

// Form Group
export const FormGroup = ({ 
  children, 
  label, 
  htmlFor, 
  required = false, 
  error, 
  className = '',
  ...props 
}) => {
  return (
    <div className={`form-group ${className}`} {...props}>
      {label && (
        <label htmlFor={htmlFor} className="form-group__label">
          {label}
          {required && <span className="form-group__required">*</span>}
        </label>
      )}
      {children}
      {error && <div className="form-group__error">{error}</div>}
    </div>
  );
};

// Input Component
export const Input = ({ 
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  className = '',
  error,
  ...props 
}) => {
  const inputClasses = [
    'form-input',
    error ? 'form-input--error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={inputClasses}
      {...props}
    />
  );
};

// Select Component
export const Select = ({ 
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  className = '',
  error,
  children,
  ...props 
}) => {
  const selectClasses = [
    'form-select',
    error ? 'form-select--error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      disabled={disabled}
      className={selectClasses}
      {...props}
    >
      {children}
    </select>
  );
};

// Textarea Component
export const Textarea = ({ 
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 3,
  disabled = false,
  className = '',
  error,
  ...props 
}) => {
  const textareaClasses = [
    'form-textarea',
    error ? 'form-textarea--error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <textarea
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={textareaClasses}
      {...props}
    />
  );
};

// Form Row for grid layout
export const FormRow = ({ children, className = '', ...props }) => {
  return (
    <div className={`form-row ${className}`} {...props}>
      {children}
    </div>
  );
};

// Form Actions
export const FormActions = ({ children, className = '', ...props }) => {
  return (
    <div className={`form-actions ${className}`} {...props}>
      {children}
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({ 
  id,
  name,
  checked,
  onChange,
  onBlur,
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  const checkboxClasses = [
    'form-checkbox',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={checkboxClasses}>
      <input
        type="checkbox"
        id={id}
        name={name}
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        {...props}
      />
      <span className="form-checkbox__checkmark"></span>
      {children && <span className="form-checkbox__label">{children}</span>}
    </label>
  );
};

// Radio Component
export const Radio = ({ 
  id,
  name,
  value,
  checked,
  onChange,
  onBlur,
  disabled = false,
  className = '',
  children,
  ...props 
}) => {
  const radioClasses = [
    'form-radio',
    className
  ].filter(Boolean).join(' ');

  return (
    <label className={radioClasses}>
      <input
        type="radio"
        id={id}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        {...props}
      />
      <span className="form-radio__checkmark"></span>
      {children && <span className="form-radio__label">{children}</span>}
    </label>
  );
};
