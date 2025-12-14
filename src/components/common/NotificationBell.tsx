import React, { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { AppNotification } from '@/types/notification';
import AuthService from '@/services/auth';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const user = AuthService.getStoredUser();
      if (user) {
        // Use employeeId since notifications are created with employee ID, not login provision ID
        const userId = String(user.employeeId || user.id);
        const count = await notificationService.getUnreadCount(userId);
        setUnreadCount(count);

        if (isOpen) {
          const list = await notificationService.getUserNotifications(userId);
          setNotifications(Array.isArray(list) ? list : []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [isOpen, fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: AppNotification) => {
    try {
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      }

      setIsOpen(false);

      // Navigate based on reference type
      if (notification.referenceType === 'PR') {
        navigate(`/purchase-requisition/view/${notification.referenceId}`); // Assumption on route
      } else if (notification.referenceType === 'PO') {
        navigate(`/purchase-orders/${notification.referenceId}`);
      }
      // Add other types as needed
    } catch (error) {
      console.error('Failed to handle notification click', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const user = AuthService.getStoredUser();
      if (user) {
        // Use employeeId since notifications are created with employee ID
        await notificationService.markAllAsRead(
          String(user.employeeId || user.id)
        );
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-1.5 text-white hover:text-white/80 hover:bg-indigo-500/20 rounded-full transition-colors focus:outline-none'
      >
        <Bell className='w-4 h-4' />
        {unreadCount > 0 && (
          <span className='absolute -top-0.5 -right-0.5 flex items-center justify-center w-3.5 h-3.5 text-[10px] font-bold text-white bg-red-500 rounded-full'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className='absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 z-50'>
          <div className='p-4 border-b border-gray-100 flex justify-between items-center'>
            <h3 className='text-sm font-semibold text-gray-900'>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className='text-xs text-blue-600 hover:text-blue-800 font-medium'
              >
                Mark all read
              </button>
            )}
          </div>

          <div className='max-h-96 overflow-y-auto'>
            {!notifications || notifications.length === 0 ? (
              <div className='p-4 text-center text-gray-500 text-sm'>
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className='flex justify-between items-start mb-1'>
                    <p
                      className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                    >
                      {notification.title}
                    </p>
                    <span className='text-xs text-gray-400 whitespace-nowrap ml-2'>
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className='text-sm text-gray-600 line-clamp-2'>
                    {notification.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
