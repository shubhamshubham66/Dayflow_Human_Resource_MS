import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  XCircle,
  CalendarDays,
  DollarSign,
  UserCircle,
  Clock,
  MessageSquare,
  Check,
} from 'lucide-react';
import notificationService from '../../services/notificationService';

/**
 * Notification Bell Dropdown
 * Shows unread count badge, clickable dropdown with recent notifications.
 * Marks all as read when opened.
 */
const NotificationDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch unread count on mount and periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      // Silently fail - notifications are non-critical
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  const handleOpen = async () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setLoading(true);
      try {
        const data = await notificationService.getAll({ limit: 10 });
        setNotifications(data.data || []);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAsRead([]);
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Handle notification click
  const handleClick = (notification) => {
    if (notification.link) {
      navigate(notification.link);
    }
    setIsOpen(false);
  };

  // Icon by notification type
  const getIcon = (type) => {
    switch (type) {
      case 'leave_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'leave_rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'leave_request':
        return <CalendarDays className="w-4 h-4 text-amber-500" />;
      case 'payroll_generated':
        return <DollarSign className="w-4 h-4 text-primary-500" />;
      case 'profile_update':
        return <UserCircle className="w-4 h-4 text-purple-500" />;
      case 'attendance_reminder':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'welcome':
        return <CheckCircle className="w-4 h-4 text-primary-500" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  // Time ago helper
  const timeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-danger-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />

          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-gray-100 z-30 animate-slide-down overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification List */}
            <div className="max-h-80 overflow-y-auto scrollbar-hide">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <div
                      key={notif._id}
                      onClick={() => handleClick(notif)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                        !notif.isRead ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-tight ${!notif.isRead ? 'font-medium text-gray-800' : 'text-gray-700'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {timeAgo(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="w-8 h-8 text-gray-200 mb-2" />
                  <p className="text-sm text-gray-500">No notifications yet</p>
                  <p className="text-xs text-gray-400 mt-0.5">You're all caught up!</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-100 px-4 py-2.5">
                <button
                  onClick={() => { setIsOpen(false); navigate('/notifications'); }}
                  className="text-xs font-medium text-primary-600 hover:text-primary-700 w-full text-center"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
