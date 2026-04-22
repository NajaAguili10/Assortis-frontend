import { useState, useMemo, useCallback } from 'react';
import {
  NotificationDTO,
  NotificationTypeEnum,
  NotificationPriorityEnum,
  NotificationFilters,
  NotificationsResponse,
  NotificationKPIs,
} from '@app/types/notification.dto';

/**
 * Custom hook for managing notifications
 * Handles notification state, filtering, and actions
 */
export function useNotifications() {
  // Mock data with realistic multilingual notifications
  const generateMockNotifications = (): NotificationDTO[] => [
    {
      id: '1',
      type: NotificationTypeEnum.TENDER,
      priority: NotificationPriorityEnum.HIGH,
      titleKey: 'notifications.tender.match.title',
      messageKey: 'notifications.tender.match.message',
      params: { title: 'Education Development Program - West Africa' },
      link: '/calls',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      actionable: true,
      actionLabel: 'notifications.action.view',
      actionLink: '/calls',
    },
    {
      id: '2',
      type: NotificationTypeEnum.INVITATION,
      priority: NotificationPriorityEnum.MEDIUM,
      titleKey: 'notifications.invitation.received.title',
      messageKey: 'notifications.invitation.received.message',
      params: { organization: 'UNICEF' },
      link: '/organizations/invitations',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      actionable: true,
      actionLabel: 'notifications.action.respond',
      actionLink: '/organizations/invitations',
    },
    {
      id: '3',
      type: NotificationTypeEnum.SUCCESS,
      priority: NotificationPriorityEnum.HIGH,
      titleKey: 'notifications.submission.validated.title',
      messageKey: 'notifications.submission.validated.message',
      params: { title: 'Healthcare Infrastructure Project' },
      link: '/projects',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      actionable: true,
      actionLabel: 'notifications.action.view',
      actionLink: '/projects',
    },
    {
      id: '4',
      type: NotificationTypeEnum.ALERT,
      priority: NotificationPriorityEnum.URGENT,
      titleKey: 'notifications.tender.urgent.title',
      messageKey: 'notifications.tender.urgent.message',
      params: { title: 'Sustainable Development Initiative' },
      link: '/calls/active',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      actionable: true,
      actionLabel: 'notifications.action.apply',
      actionLink: '/calls/active',
    },
    {
      id: '5',
      type: NotificationTypeEnum.PARTNERSHIP,
      priority: NotificationPriorityEnum.MEDIUM,
      titleKey: 'notifications.partnership.request.title',
      messageKey: 'notifications.partnership.request.message',
      params: { organization: 'World Bank' },
      link: '/organizations/partnerships',
      read: true,
      archived: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      actionable: true,
      actionLabel: 'notifications.action.review',
      actionLink: '/organizations/partnerships',
    },
    {
      id: '6',
      type: NotificationTypeEnum.TEAM,
      priority: NotificationPriorityEnum.LOW,
      titleKey: 'notifications.team.member.title',
      messageKey: 'notifications.team.member.message',
      params: { name: 'Sarah Johnson' },
      link: '/organizations/teams',
      read: true,
      archived: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      actionable: true,
      actionLabel: 'notifications.action.view',
      actionLink: '/organizations/teams',
    },
    {
      id: '7',
      type: NotificationTypeEnum.TENDER,
      priority: NotificationPriorityEnum.HIGH,
      titleKey: 'notifications.tender.deadline.title',
      messageKey: 'notifications.tender.deadline.message',
      params: { title: 'Climate Change Adaptation', days: '3' },
      link: '/calls',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      actionable: true,
      actionLabel: 'notifications.action.view',
      actionLink: '/calls',
    },
    {
      id: '8',
      type: NotificationTypeEnum.MESSAGE,
      priority: NotificationPriorityEnum.MEDIUM,
      titleKey: 'notifications.message.new.title',
      messageKey: 'notifications.message.new.message',
      params: { sender: 'John Doe' },
      link: '/assistance/history',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      actionable: true,
      actionLabel: 'notifications.action.reply',
      actionLink: '/assistance/history',
    },
    {
      id: '9',
      type: NotificationTypeEnum.SUBMISSION,
      priority: NotificationPriorityEnum.HIGH,
      titleKey: 'notifications.training.enrollment.title',
      messageKey: 'notifications.training.enrollment.message',
      params: { course: 'Project Management Essentials' },
      link: '/training/catalog',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      actionable: true,
      actionLabel: 'notifications.action.access',
      actionLink: '/training/catalog',
    },
    {
      id: '10',
      type: NotificationTypeEnum.SUCCESS,
      priority: NotificationPriorityEnum.MEDIUM,
      titleKey: 'notifications.certification.awarded.title',
      messageKey: 'notifications.certification.awarded.message',
      params: { certification: 'Advanced Procurement' },
      link: '/training/certifications',
      read: true,
      archived: false,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      actionable: true,
      actionLabel: 'notifications.action.download',
      actionLink: '/training/certifications',
    },
    {
      id: '11',
      type: NotificationTypeEnum.ALERT,
      priority: NotificationPriorityEnum.URGENT,
      titleKey: 'notifications.session.reminder.title',
      messageKey: 'notifications.session.reminder.message',
      params: { session: 'Webinar on Grant Writing', time: '2 hours' },
      link: '/training/live-sessions',
      read: false,
      archived: false,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      actionable: true,
      actionLabel: 'notifications.action.join',
      actionLink: '/training/live-sessions',
    },
    {
      id: '12',
      type: NotificationTypeEnum.SYSTEM,
      priority: NotificationPriorityEnum.LOW,
      titleKey: 'notifications.system.update.title',
      messageKey: 'notifications.system.update.message',
      read: true,
      archived: false,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      actionable: false,
    },
  ];

  const [notifications, setNotifications] = useState<NotificationDTO[]>(generateMockNotifications());
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    let result = [...notifications];

    // Filter by type
    if (filters.type && filters.type.length > 0) {
      result = result.filter((n) => filters.type!.includes(n.type));
    }

    // Filter by priority
    if (filters.priority && filters.priority.length > 0) {
      result = result.filter((n) => filters.priority!.includes(n.priority));
    }

    // Filter by read status
    if (filters.read !== undefined) {
      result = result.filter((n) => n.read === filters.read);
    }

    // Filter by archived status
    if (filters.archived !== undefined) {
      result = result.filter((n) => n.archived === filters.archived);
    }

    // Filter by date range
    if (filters.dateFrom) {
      result = result.filter((n) => n.createdAt >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      result = result.filter((n) => n.createdAt <= filters.dateTo!);
    }

    // Sort by date (most recent first)
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  }, [notifications, filters]);

  // Paginated notifications
  const paginatedNotifications = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredNotifications.slice(startIndex, endIndex);
  }, [filteredNotifications, currentPage]);

  // KPIs
  const kpis = useMemo((): NotificationKPIs => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    return {
      total: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      urgent: notifications.filter((n) => n.priority === NotificationPriorityEnum.URGENT && !n.read).length,
      today: notifications.filter((n) => n.createdAt >= todayStart).length,
      thisWeek: notifications.filter((n) => n.createdAt >= weekStart).length,
    };
  }, [notifications]);

  // Response object
  const notificationsResponse = useMemo((): NotificationsResponse => {
    const totalPages = Math.ceil(filteredNotifications.length / pageSize);
    
    return {
      data: paginatedNotifications,
      meta: {
        totalItems: filteredNotifications.length,
        unreadCount: kpis.unread,
        urgentCount: kpis.urgent,
        pageSize,
        currentPage,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
      },
    };
  }, [paginatedNotifications, filteredNotifications, kpis, currentPage]);

  // Get active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.type && filters.type.length > 0) count += filters.type.length;
    if (filters.priority && filters.priority.length > 0) count += filters.priority.length;
    if (filters.read !== undefined) count += 1;
    if (filters.archived !== undefined) count += 1;
    if (filters.dateFrom) count += 1;
    if (filters.dateTo) count += 1;
    return count;
  }, [filters]);

  // Actions
  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: true, readAt: new Date() } : n
      )
    );
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, read: false, readAt: undefined } : n
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    const now = new Date();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, readAt: now }))
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const archiveNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, archived: true } : n
      )
    );
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationDTO, 'id' | 'read' | 'archived' | 'createdAt'>) => {
    const newNotification: NotificationDTO = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      archived: false,
      createdAt: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<NotificationFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  return {
    notifications: notificationsResponse,
    kpis,
    filters,
    updateFilters,
    clearFilters,
    activeFiltersCount,
    currentPage,
    setCurrentPage,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
    addNotification,
  };
}