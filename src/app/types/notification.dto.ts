/**
 * NOTIFICATION DTO
 * Data Transfer Objects for Assortis Notification System
 */

export enum NotificationTypeEnum {
  TENDER = 'TENDER',
  INVITATION = 'INVITATION',
  SUBMISSION = 'SUBMISSION',
  SUCCESS = 'SUCCESS',
  ALERT = 'ALERT',
  MESSAGE = 'MESSAGE',
  PARTNERSHIP = 'PARTNERSHIP',
  TEAM = 'TEAM',
  SYSTEM = 'SYSTEM',
}

export enum NotificationPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface NotificationDTO {
  id: string;
  type: NotificationTypeEnum;
  priority: NotificationPriorityEnum;
  titleKey: string;
  messageKey: string;
  params?: Record<string, string>;
  link?: string;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actionable: boolean;
  actionLabel?: string;
  actionLink?: string;
}

export interface NotificationFilters {
  type?: NotificationTypeEnum[];
  priority?: NotificationPriorityEnum[];
  read?: boolean;
  archived?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationMeta {
  totalItems: number;
  unreadCount: number;
  urgentCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsResponse {
  data: NotificationDTO[];
  meta: NotificationMeta;
}

export interface NotificationKPIs {
  total: number;
  unread: number;
  urgent: number;
  today: number;
  thisWeek: number;
}
