import React from 'react';

/**
 * Dayflow Logo component.
 * Renders the brand logo with optional text and size variants.
 */
const Logo = ({ size = 'md', showText = true, className = '' }) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-xl' },
    md: { icon: 'w-10 h-10', text: 'text-2xl' },
    lg: { icon: 'w-14 h-14', text: 'text-4xl' },
    xl: { icon: 'w-20 h-20', text: 'text-5xl' },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <div className={`${icon} relative`}>
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="10" fill="#2f5597" />
          <path
            d="M10 20C10 14.477 14.477 10 20 10C25.523 10 30 14.477 30 20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M14 24C14 21.239 16.239 19 19 19H21C23.761 19 26 21.239 26 24"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <circle cx="20" cy="27" r="2.5" fill="white" />
        </svg>
      </div>

      {/* Logo Text */}
      {showText && (
        <span className={`${text} font-bold text-primary-500 tracking-tight`}>
          Dayflow
        </span>
      )}
    </div>
  );
};

export default Logo;
