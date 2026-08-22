import React from 'react';
import { User } from 'lucide-react';

/**
 * Avatar component with fallback initials or icon.
 */
const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const Avatar = ({ src, name = '', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-gray-100 ${className}`}
      />
    );
  }

  if (initials) {
    return (
      <div
        className={`${sizes[size]} rounded-full bg-primary-100 text-primary-600 font-semibold flex items-center justify-center flex-shrink-0 ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gray-100 text-gray-400 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <User className="w-1/2 h-1/2" />
    </div>
  );
};

export default Avatar;
