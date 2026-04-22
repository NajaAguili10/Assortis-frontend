import { useNavigate } from 'react-router';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  FileText,
  Mail,
  Handshake,
  UserPlus,
  Settings,
  Star,
  Trash2,
  Archive,
  ExternalLink,
  X,
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useNotificationsContext } from '../contexts/NotificationsContext';
import { NotificationTypeEnum, NotificationPriorityEnum } from '../types/notification.dto';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './ui/sheet';
import { toast } from 'sonner';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
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

  const getPriorityColor = (priority: NotificationPriorityEnum) => {
    switch (priority) {
      case NotificationPriorityEnum.URGENT:
        return 'bg-red-100 text-red-700 border-red-200';
      case NotificationPriorityEnum.HIGH:
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case NotificationPriorityEnum.MEDIUM:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case NotificationPriorityEnum.LOW:
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
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
      onClose();
      navigate(link);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[450px] p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <SheetTitle className="text-xl font-semibold text-primary">
                  {t('notifications.title')}
                </SheetTitle>
                {kpis.unread > 0 && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {t('notifications.unread', { count: kpis.unread.toString() })}
                  </p>
                )}
              </div>
            </div>
            {kpis.unread > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
              >
                {t('notifications.markAllRead')}
              </Button>
            )}
          </div>

          {/* Hidden description for accessibility */}
          <SheetDescription className="sr-only">
            {t('notifications.emptyMessage')}
          </SheetDescription>

          {/* Priority Badges */}
          {(kpis.urgent > 0 || kpis.today > 0) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              {kpis.urgent > 0 && (
                <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {kpis.urgent} {t('notifications.priority.URGENT')}
                </Badge>
              )}
              {kpis.today > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {kpis.today} {t('notifications.time.now')}
                </Badge>
              )}
            </div>
          )}
        </SheetHeader>

        {/* Notifications List */}
        <ScrollArea className="flex-1">
          {notifications.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-6">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-primary mb-1">
                {t('notifications.empty')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('notifications.emptyMessage')}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.data.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors group relative cursor-pointer ${
                    !notification.read ? 'bg-blue-50/30' : ''
                  } ${
                    notification.priority === NotificationPriorityEnum.URGENT && !notification.read
                      ? 'border-l-4 border-l-red-500'
                      : ''
                  }`}
                  onClick={() => handleNotificationClick(notification.id, notification.link)}
                >
                  <div className="flex items-start gap-3 pr-8">
                    {/* Icon */}
                    <div className="mt-0.5 flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title and Priority */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-1">
                          <h4
                            className={`font-medium text-sm ${
                              !notification.read ? 'text-gray-900' : 'text-gray-700'
                            }`}
                          >
                            {t(notification.titleKey, notification.params)}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        {notification.priority === NotificationPriorityEnum.URGENT && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${getPriorityColor(notification.priority)}`}
                          >
                            {t(`notifications.priority.${notification.priority}`)}
                          </Badge>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
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
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveNotification(notification.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-gray-200"
                      title={t('notifications.archive')}
                    >
                      <Archive className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 hover:bg-gray-200"
                      title={t('notifications.delete')}
                    >
                      <X className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.data.length > 0 && (
          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <Button
              onClick={() => {
                onClose();
                navigate('/notifications');
              }}
              variant="outline"
              className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
            >
              {t('notifications.viewAll')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}