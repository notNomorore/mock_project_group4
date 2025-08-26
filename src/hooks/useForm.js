import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const validate = useCallback((validationRules) => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(field => {
      const value = values[field];
      const rules = validationRules[field];
      
      if (rules.required && (!value || value.toString().trim() === '')) {
        newErrors[field] = rules.required;
      } else if (rules.pattern && !rules.pattern.test(value)) {
        newErrors[field] = rules.patternMessage || 'Invalid format';
      } else if (rules.minLength && value && value.length < rules.minLength) {
        newErrors[field] = rules.minLengthMessage || `Minimum length is ${rules.minLength}`;
      } else if (rules.maxLength && value && value.length > rules.maxLength) {
        newErrors[field] = rules.maxLengthMessage || `Maximum length is ${rules.maxLength}`;
      } else if (rules.custom) {
        const customError = rules.custom(value, values);
        if (customError) {
          newErrors[field] = customError;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const isValid = useCallback(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const hasErrors = useCallback(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const getFieldError = useCallback((name) => {
    return touched[name] && errors[name];
  }, [touched, errors]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    setValue,
    setError,
    setFieldError,
    reset,
    validate,
    isValid,
    hasErrors,
    getFieldError,
  };
};
