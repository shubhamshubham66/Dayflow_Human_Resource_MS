import React from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

/**
 * Reusable Select dropdown component.
 * Styled consistently with the Input component.
 */
const Select = ({
  label,
  options = [],
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}) => {
  const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}

      {/* Select wrapper */}
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="w-5 h-5" />
          </div>
        )}

        {/* Select field */}
        <select
          id={selectId}
          className={`
            w-full px-4 py-3 border rounded-lg shadow-input
            text-gray-800 appearance-none cursor-pointer
            transition-all duration-200
            focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100
            ${Icon ? 'pl-11' : ''}
            pr-10
            ${error
              ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-50'
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <ChevronDown className="w-5 h-5" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-danger-500 animate-slide-down" role="alert">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Helper text */}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default Select;
