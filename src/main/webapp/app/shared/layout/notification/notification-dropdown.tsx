import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCheckCircle, faComments, faInfoCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useAppDispatch, useAppSelector } from 'app/config/store';
import { markAllAsRead, setShowHistory, getLatestNotification } from 'app/shared/reducers/notification';
import { Notification } from 'app/shared/reducers/notification';

interface NotificationDropdownProps {
  isOpen: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen }) => {
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector(state => state.notification.unreadCount);
  const latestNotification = useAppSelector(state => state.notification.latestNotification);
  const notificationHistory = useAppSelector(state => state.notification.notificationHistory);
  const showHistory = useAppSelector(state => state.notification.showHistory);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Fetch latest notification when dropdown opens
      dispatch(getLatestNotification());
      // Initialize with latest notification from Redux state when dropdown opens
      if (latestNotification) {
        setNotifications([latestNotification]);
      } else if (notificationHistory.length > 0) {
        setNotifications(notificationHistory.slice(0, 10));
      }
    }
  }, [isOpen, latestNotification, notificationHistory, dispatch]);

  useEffect(() => {
    if (latestNotification) {
      setNotifications(prev => [latestNotification, ...prev].slice(0, 10));
    }
  }, [latestNotification]);

  useEffect(() => {
    if (showHistory && notificationHistory.length > 0) {
      setNotifications(notificationHistory);
    }
  }, [showHistory, notificationHistory]);

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    setNotifications([]);
  };

  const handleShowHistory = () => {
    dispatch(setShowHistory(true));
  };

  const handleBackToRecent = () => {
    dispatch(setShowHistory(false));
    if (latestNotification) {
      setNotifications([latestNotification]);
    } else {
      setNotifications([]);
    }
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'CHAT_MESSAGE':
        return faComments;
      case 'STATUS_UPDATE':
        return faCheckCircle;
      default:
        return faInfoCircle;
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case 'CHAT_MESSAGE':
        return 'bg-blue-100 text-blue-600';
      case 'STATUS_UPDATE':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showHistory && (
            <button onClick={handleBackToRecent} className="text-slate-600 hover:text-slate-800">
              <FontAwesomeIcon icon={faChevronDown} className="rotate-90" />
            </button>
          )}
          <h3 className="font-semibold text-slate-800">{showHistory ? 'Historique des notifications' : 'Notifications'}</h3>
        </div>
        {unreadCount > 0 && !showHistory && (
          <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FontAwesomeIcon icon={faBell} className="text-4xl text-slate-300 mb-3" />
            <p>Aucune notification</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div key={index} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                  <FontAwesomeIcon icon={getNotificationIcon(notification.type)} className="text-sm" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">{notification.title}</p>
                  <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
                  {notification.timestamp && (
                    <p className="text-slate-400 text-xs mt-2">
                      {new Date(notification.timestamp).toLocaleString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && !showHistory && (
        <div className="p-3 border-t border-slate-100 text-center">
          <button onClick={handleShowHistory} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Voir toutes les notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
