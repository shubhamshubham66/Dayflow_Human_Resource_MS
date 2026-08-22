import React from 'react';

/**
 * Dayflow Logo component.
 * Uses the uploaded WhatsApp image as the logo icon.
 * Renders with optional text and size variants.
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
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Image */}
      <img
        src="/logo.jpeg"
        alt="Dayflow Logo"
        className={`${icon} rounded-lg object-cover`}
      />

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
