import { createContext, useContext, ReactNode } from 'react';
import { useNotifications } from '../modules/administrator/hooks/useNotifications';

/**
 * Context for sharing notifications state across components
 * This ensures that notification actions (like markAllAsRead) update all UI elements
 */
const NotificationsContext = createContext<ReturnType<typeof useNotifications> | null>(null);

interface NotificationsProviderProps {
  children: ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const notifications = useNotifications();
  
  return (
    <NotificationsContext.Provider value={notifications}>
      {children}
    </NotificationsContext.Provider>
  );
}

/**
 * Hook to access notifications context
 * Must be used within NotificationsProvider
 */
export function useNotificationsContext() {
  const context = useContext(NotificationsContext);
  
  if (!context) {
    throw new Error('useNotificationsContext must be used within NotificationsProvider');
  }
  
  return context;
}
