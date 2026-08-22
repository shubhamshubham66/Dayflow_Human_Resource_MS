import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  DollarSign,
  BarChart3,
  Settings,
  UserCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * Sidebar navigation for authenticated pages.
 * Shows different menu items based on user role.
 */

// Navigation items per role
const employeeNavItems = [
  { to: '/employee-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'My Profile', icon: UserCircle },
  { to: '/attendance', label: 'Attendance', icon: Clock },
  { to: '/leave', label: 'Leave', icon: CalendarDays },
  { to: '/payroll', label: 'Payroll', icon: DollarSign },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const adminNavItems = [
  { to: '/admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employees', label: 'Employees', icon: Users },
  { to: '/attendance-manage', label: 'Attendance', icon: Clock },
  { to: '/leave-manage', label: 'Leave Requests', icon: CalendarDays },
  { to: '/payroll-manage', label: 'Payroll', icon: DollarSign },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navItems = user?.role === 'admin' ? adminNavItems : employeeNavItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 bottom-0 z-30
          w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <nav className="flex flex-col h-full py-4 px-3 overflow-y-auto scrollbar-hide">
          {/* Main navigation */}
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Bottom section */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="px-4 py-3 bg-primary-50 rounded-lg">
              <p className="text-xs font-medium text-primary-700">Dayflow HRMS</p>
              <p className="text-xs text-primary-500 mt-0.5">v1.0.0 • Complete</p>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
