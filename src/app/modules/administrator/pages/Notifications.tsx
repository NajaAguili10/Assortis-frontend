import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useNotificationsContext } from '@app/contexts/NotificationsContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  Handshake,
  UserPlus,
  Settings,
  Archive,
  X,
  ExternalLink,
  CheckCheck,
  Filter,
  ChevronDown,
} from 'lucide-react';
import { NotificationTypeEnum, NotificationPriorityEnum } from '@app/types/notification.dto';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@app/components/ui/select';

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    notifications,
    kpis,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    archiveNotification,
  } = useNotificationsContext();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterRead, setFilterRead] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const getIcon = (type: NotificationTypeEnum) => {
    switch (type) {
      case NotificationTypeEnum.TENDER:
        return <FileText className="h-5 w-5 text-red-500" />;
      case NotificationTypeEnum.INVITATION:
        return <Mail className="h-5 w-5 text-purple-500" />;
      case NotificationTypeEnum.SUBMISSION:
        return <FileText className="h-5 w-5 text-blue-500" />;
      case NotificationTypeEnum.SUCCESS:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case NotificationTypeEnum.ALERT:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case NotificationTypeEnum.MESSAGE:
        return <Mail className="h-5 w-5 text-blue-500" />;
      case NotificationTypeEnum.PARTNERSHIP:
        return <Handshake className="h-5 w-5 text-indigo-500" />;
      case NotificationTypeEnum.TEAM:
        return <UserPlus className="h-5 w-5 text-teal-500" />;
      case NotificationTypeEnum.SYSTEM:
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: NotificationPriorityEnum) => {
    switch (priority) {
      case NotificationPriorityEnum.URGENT:
        return { label: t('notifications.priority.URGENT'), className: 'bg-red-100 text-red-700 border-red-200' };
      case NotificationPriorityEnum.HIGH:
        return { label: t('notifications.priority.HIGH'), className: 'bg-orange-100 text-orange-700 border-orange-200' };
      case NotificationPriorityEnum.MEDIUM:
        return { label: t('notifications.priority.MEDIUM'), className: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
      case NotificationPriorityEnum.LOW:
        return { label: t('notifications.priority.LOW'), className: 'bg-gray-100 text-gray-700 border-gray-200' };
      default:
        return { label: 'Normal', className: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return t('notifications.time.now');
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return t('notifications.time.minutes', { count: diffInMinutes.toString() });
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours === 1) {
      return t('notifications.time.hour');
    }
    if (diffInHours < 24) {
      return t('notifications.time.hours', { count: diffInHours.toString() });
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) {
      return t('notifications.time.yesterday');
    }
    if (diffInDays < 7) {
      return t('notifications.time.days', { count: diffInDays.toString() });
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks === 1) {
      return t('notifications.time.week');
    }
    if (diffInWeeks < 4) {
      return t('notifications.time.weeks', { count: diffInWeeks.toString() });
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths === 1) {
      return t('notifications.time.month');
    }
    return t('notifications.time.months', { count: diffInMonths.toString() });
  };

  const handleNotificationClick = (notificationId: string, link?: string) => {
    markAsRead(notificationId);
    if (link) {
      navigate(link);
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.data.filter((notification) => {
    if (filterType !== 'ALL' && notification.type !== filterType) {
      return false;
    }
    if (filterRead === 'UNREAD' && notification.read) {
      return false;
    }
    if (filterRead === 'READ' && !notification.read) {
      return false;
    }
    if (filterPriority !== 'ALL' && notification.priority !== filterPriority) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('notifications.title')}
        description={t('notifications.emptyMessage')}
        icon={Bell}
        stats={[
          { value: kpis.total.toString(), label: t('notifications.stats.total') },
          { value: kpis.unread.toString(), label: t('notifications.stats.unread') },
          { value: kpis.urgent.toString(), label: t('notifications.stats.urgent') },
        ]}
      />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <Separator className="my-6" />

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">
                {t('common.filters')}
              </h3>
            </div>
            
            {kpis.unread > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <CheckCheck className="w-4 h-4 mr-2" />
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Filter by Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('notifications.filters.type')}
              </label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.TENDER}>{t('notifications.type.TENDER')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.INVITATION}>{t('notifications.type.INVITATION')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.SUBMISSION}>{t('notifications.type.SUBMISSION')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.SUCCESS}>{t('notifications.type.SUCCESS')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.ALERT}>{t('notifications.type.ALERT')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.MESSAGE}>{t('notifications.type.MESSAGE')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.PARTNERSHIP}>{t('notifications.type.PARTNERSHIP')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.TEAM}>{t('notifications.type.TEAM')}</SelectItem>
                  <SelectItem value={NotificationTypeEnum.SYSTEM}>{t('notifications.type.SYSTEM')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Read Status */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('notifications.filters.status')}
              </label>
              <Select value={filterRead} onValueChange={setFilterRead}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  <SelectItem value="UNREAD">{t('notifications.filters.unread')}</SelectItem>
                  <SelectItem value="READ">{t('notifications.filters.read')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filter by Priority */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                {t('notifications.filters.priority')}
              </label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">{t('common.all')}</SelectItem>
                  <SelectItem value={NotificationPriorityEnum.URGENT}>{t('notifications.priority.URGENT')}</SelectItem>
                  <SelectItem value={NotificationPriorityEnum.HIGH}>{t('notifications.priority.HIGH')}</SelectItem>
                  <SelectItem value={NotificationPriorityEnum.MEDIUM}>{t('notifications.priority.MEDIUM')}</SelectItem>
                  <SelectItem value={NotificationPriorityEnum.LOW}>{t('notifications.priority.LOW')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Results Count */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredNotifications.length} {t('common.results').toLowerCase()}
            </p>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">
                {t('notifications.empty')}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {t('notifications.emptyMessage')}
              </p>
              <Button variant="outline" onClick={() => navigate('/')}>
                {t('common.back')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const priorityBadge = getPriorityBadge(notification.priority);
                
                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg border hover:border-primary/50 hover:shadow-md transition-all duration-200 group cursor-pointer ${
                      !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''
                    } ${
                      notification.priority === NotificationPriorityEnum.URGENT && !notification.read
                        ? 'border-l-4 border-l-red-500'
                        : ''
                    }`}
                    onClick={() => handleNotificationClick(notification.id, notification.link)}
                  >
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className="mt-1 flex-shrink-0">
                          {getIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Title and Priority */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-1">
                              <h4
                                className={`font-semibold text-base ${
                                  !notification.read ? 'text-gray-900' : 'text-gray-700'
                                }`}
                              >
                                {t(notification.titleKey, notification.params)}
                              </h4>
                              {!notification.read && (
                                <span className="w-2.5 h-2.5 bg-blue-600 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {notification.priority !== NotificationPriorityEnum.LOW && (
                                <Badge variant="outline" className={priorityBadge.className}>
                                  {priorityBadge.label}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Message */}
                          <p className="text-sm text-gray-600 mb-3">
                            {t(notification.messageKey, notification.params)}
                          </p>

                          {/* Footer */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(notification.createdAt)}
                            </span>
                            {notification.actionable && notification.actionLabel && (
                              <Button
                                variant="link"
                                size="sm"
                                className="text-xs h-auto p-0 text-blue-600 hover:text-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (notification.actionLink) {
                                    handleNotificationClick(notification.id, notification.actionLink);
                                  }
                                }}
                              >
                                {t(notification.actionLabel)}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              archiveNotification(notification.id);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-200"
                            title={t('notifications.archive')}
                          >
                            <Archive className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-gray-200"
                            title={t('notifications.delete')}
                          >
                            <X className="h-4 w-4 text-gray-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
