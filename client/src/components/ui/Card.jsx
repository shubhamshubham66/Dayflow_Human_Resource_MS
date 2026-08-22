import React from 'react';

/**
 * Reusable Card component with hover and padding variants.
 */
const Card = ({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-card
        ${hoverable ? 'transition-shadow duration-200 hover:shadow-card-hover' : ''}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
