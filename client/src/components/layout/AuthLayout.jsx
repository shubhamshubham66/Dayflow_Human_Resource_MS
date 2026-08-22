import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

/**
 * Layout wrapper for authentication pages (Sign In, Sign Up, Verify).
 * Centered card design with brand elements.
 */
const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 flex flex-col">
      {/* Header with logo */}
      <header className="p-6">
        <Link to="/">
          <Logo size="sm" />
        </Link>
      </header>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md animate-fade-in">
          {/* Title section */}
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-2 text-gray-500 text-sm sm:text-base">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Dayflow HRMS. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default AuthLayout;
