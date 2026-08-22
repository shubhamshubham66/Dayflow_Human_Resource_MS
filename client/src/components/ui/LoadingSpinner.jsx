import React from 'react';

/**
 * Loading spinner with Dayflow brand colors.
 * Used for page-level and component-level loading states.
 */
const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          border-3 border-gray-200 border-t-primary-500
          rounded-full animate-spin
        `}
        style={{ borderWidth: '3px' }}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

/**
 * Full-page loading state with spinner and optional message
 */
export const PageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-gray-500 text-sm font-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
