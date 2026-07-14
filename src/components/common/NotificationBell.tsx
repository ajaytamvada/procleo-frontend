import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  Bell,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Package,
  Receipt,
  Truck,
  Wallet,
  Info,
} from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { AppNotification } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

/**
 * Fallback deep-link resolver, used only when the backend didn't supply an
 * actionUrl. Reference types are the exact backend `refType` strings.
 */
const getNotificationRoute = (
  refType: string | null | undefined,
  refId: number | null | undefined
): string | null => {
  if (!refType || refId == null) return null;
  switch (refType.toUpperCase()) {
    case 'PR':
      return `/purchase-requisition/preview/${refId}`;
    case 'GRN':
      return `/grn/preview/${refId}`;
    case 'PO':
    case 'PURCHASE_ORDER':
      return `/purchase-orders/${refId}`;
    case 'INVOICE':
      return `/invoice/preview/${refId}`;
    case 'RFP':
      return `/rfp/${refId}`;
    case 'PAYMENT':
      return `/payment/preview/${refId}`;
    default:
      return null;
  }
};

/** Icon + accent colour per category, for quick visual scanning of the list. */
const categoryVisual = (
  category: string | null | undefined
): { Icon: typeof Bell; color: string } => {
  switch ((category || '').toUpperCase()) {
    case 'APPROVAL':
      return { Icon: ClipboardCheck, color: 'text-amber-600 bg-amber-50' };
    case 'PURCHASE_REQUISITION':
      return { Icon: FileText, color: 'text-indigo-600 bg-indigo-50' };
    case 'PURCHASE_ORDER':
      return { Icon: Package, color: 'text-blue-600 bg-blue-50' };
    case 'GRN':
      return { Icon: Truck, color: 'text-teal-600 bg-teal-50' };
    case 'RFP':
      return { Icon: FileText, color: 'text-violet-600 bg-violet-50' };
    case 'INVOICE':
      return { Icon: Receipt, color: 'text-rose-600 bg-rose-50' };
    case 'PAYMENT':
      return { Icon: Wallet, color: 'text-green-600 bg-green-50' };
    default:
      return { Icon: Info, color: 'text-gray-500 bg-gray-100' };
  }
};

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const count = await notificationService.getMyUnreadCount();
      setUnreadCount(count);

      if (isOpen) {
        const list = await notificationService.getMyNotifications();
        setNotifications(Array.isArray(list) ? list : []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  }, [isOpen]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

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
      if (!notification.read) {
        await notificationService.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, read: true } : n))
        );
      }

      setIsOpen(false);

      // Prefer the backend-computed deep-link; fall back to reference mapping.
      const target =
        notification.actionUrl ||
        getNotificationRoute(notification.refType, notification.refId);
      if (target) {
        navigate(target);
      }
    } catch (error) {
      console.error('Failed to handle notification click', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative p-2 text-white hover:text-white/80 hover:bg-indigo-500/20 rounded-lg transition-all duration-200 focus:outline-none'
        title={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'Notifications'
        }
      >
        <Bell className='w-5 h-5' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[rgb(19,9,81)] shadow-lg'>
            {unreadCount > 99 ? '99+' : unreadCount}
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
              <div className='p-6 text-center text-gray-500 text-sm flex flex-col items-center gap-2'>
                <CheckCircle2 className='w-6 h-6 text-gray-300' />
                No notifications
              </div>
            ) : (
              notifications.map(notification => {
                const { Icon, color } = categoryVisual(notification.category);
                const urgent =
                  (notification.priority || '').toUpperCase() === 'HIGH' ||
                  (notification.priority || '').toUpperCase() === 'URGENT';
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${
                      !notification.read ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <span
                      className={`flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full ${color}`}
                    >
                      <Icon className='w-4 h-4' />
                    </span>
                    <div className='min-w-0 flex-1'>
                      <div className='flex justify-between items-start mb-1 gap-2'>
                        <p
                          className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}
                        >
                          {urgent && (
                            <span className='inline-block w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 align-middle' />
                          )}
                          {notification.title}
                        </p>
                        <span className='text-xs text-gray-400 whitespace-nowrap'>
                          {notification.createdAt
                            ? formatDistanceToNow(
                                new Date(notification.createdAt),
                                { addSuffix: true }
                              )
                            : ''}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 line-clamp-2'>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
