import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface AdminNotification {
  id: string;
  message: string;
  time: string;
  type: 'new' | 'info' | 'feedback' | 'review' | 'signup' | 'application' | 'milestone';
  userId?: string;
  userName?: string;
  userEmail?: string;
  userRole?: 'user' | 'admin';
  createdAt: string;
  read: boolean;
}

interface NotificationsContextType {
  notifications: AdminNotification[];
  addNotification: (notification: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  getUnreadCount: () => number;
  getRecentNotifications: (limit?: number) => AdminNotification[];
  refreshNotifications: () => Promise<void>;
  // Specific notification creators
  createSignupNotification: (userName: string, userEmail: string, userRole: 'user' | 'admin') => void;
  createApplicationNotification: (startupName: string, founderName: string, sector: string) => void;
  createMilestoneNotification: (startupName: string, milestone: string) => void;
  createFeedbackNotification: (startupName: string, mentorName: string) => void;
  createReviewNotification: (startupName: string, reviewType: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// Helper function to format time relative to now
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? '' : 's'} ago`;
};

export const NotificationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch notifications from backend when admin is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && user.role === 'admin' && user.id) {
        try {
          const response = await fetch(`${API_URL}/api/notifications/admin/${user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            // Format time for each notification
            const formattedNotifications = data.map((notification: AdminNotification) => ({
              ...notification,
              time: notification.time || formatRelativeTime(notification.createdAt)
            }));
            setNotifications(formattedNotifications);
          }
        } catch (error) {
          console.error('Error fetching admin notifications:', error);
        }
      }
    };

    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, API_URL]);

  const addNotification = (notificationData: Omit<AdminNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: AdminNotification = {
      ...notificationData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );

    // Update backend if admin is logged in
    if (user && user.role === 'admin') {
      try {
        await fetch(`${API_URL}/api/notifications/admin/${id}/read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Error marking notification as read:', error);
        // Revert on error
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, read: false }
              : notification
          )
        );
      }
    }
  };

  const markAllAsRead = async () => {
    // Optimistically update UI
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );

    // Update backend for each unread notification if admin is logged in
    if (user && user.role === 'admin') {
      const unreadNotifications = notifications.filter(n => !n.read);
      try {
        await Promise.all(
          unreadNotifications.map(notification =>
            fetch(`${API_URL}/api/notifications/admin/${notification.id}/read`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
            })
          )
        );
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistically update UI
    const notificationToDelete = notifications.find(n => n.id === id);
    setNotifications(prev => prev.filter(notification => notification.id !== id));

    // Delete from backend if admin is logged in
    if (user && user.role === 'admin') {
      try {
        const response = await fetch(`${API_URL}/api/notifications/admin/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete notification');
        }
      } catch (error) {
        console.error('Error deleting notification:', error);
        // Revert on error - add the notification back
        if (notificationToDelete) {
          setNotifications(prev => [...prev, notificationToDelete].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ));
        }
      }
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.read).length;
  };

  // Refresh notifications manually
  const refreshNotifications = async () => {
    if (user && user.role === 'admin' && user.id) {
      try {
        const response = await fetch(`${API_URL}/api/notifications/admin/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Format time for each notification
          const formattedNotifications = data.map((notification: AdminNotification) => ({
            ...notification,
            time: notification.time || formatRelativeTime(notification.createdAt)
          }));
          setNotifications(formattedNotifications);
        }
      } catch (error) {
        console.error('Error refreshing admin notifications:', error);
      }
    }
  };

  const getRecentNotifications = (limit: number = 10) => {
    return notifications
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  // Specific notification creators
  const createSignupNotification = (userName: string, userEmail: string, userRole: 'user' | 'admin') => {
    const roleText = userRole === 'admin' ? 'admin' : 'user';
    const message = `New ${roleText} registered: ${userName}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'signup',
      userId: Date.now().toString(),
      userName,
      userEmail,
      userRole
    });
  };

  const createApplicationNotification = (startupName: string, founderName: string, sector: string) => {
    const message = `New application from ${startupName} (${sector}) by ${founderName}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'application',
      userId: Date.now().toString(),
      userName: founderName,
      userRole: 'user'
    });
  };

  const createMilestoneNotification = (startupName: string, milestone: string) => {
    const message = `${startupName} completed milestone: ${milestone}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'milestone',
      userName: startupName
    });
  };

  const createFeedbackNotification = (startupName: string, mentorName: string) => {
    const message = `Mentor feedback submitted for ${startupName} by ${mentorName}`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'feedback',
      userName: mentorName
    });
  };

  const createReviewNotification = (startupName: string, reviewType: string) => {
    const message = `${startupName} ${reviewType} requires admin review`;
    
    addNotification({
      message,
      time: 'Just now',
      type: 'review',
      userName: startupName
    });
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      getUnreadCount,
      getRecentNotifications,
      refreshNotifications,
      createSignupNotification,
      createApplicationNotification,
      createMilestoneNotification,
      createFeedbackNotification,
      createReviewNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
