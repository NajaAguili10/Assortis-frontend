import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import {
  Clock,
  MessageCircle,
  Rocket,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  FileText,
} from 'lucide-react';

export interface HistoryEntry {
  id: string;
  type: 'CONTACT' | 'COLLABORATION' | 'INVITATION';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'SENT' | 'RESPONDED';
  targetName: string; // Expert name or Project title
  targetRole?: string; // Expert role or Organization
  date: Date;
  subject?: string;
  message?: string;
  responseMessage?: string;
  responseDate?: Date;
}

interface AssistanceHistoryCardProps {
  entries: HistoryEntry[];
}

export function AssistanceHistoryCard({
  entries,
}: AssistanceHistoryCardProps) {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CONTACT' | 'COLLABORATION' | 'INVITATION'>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const getStatusConfig = (status: HistoryEntry['status']) => {
    switch (status) {
      case 'PENDING':
        return {
          label: t('assistance.history.status.pending'),
          bgColor: 'bg-orange-50',
          textColor: 'text-orange-700',
          borderColor: 'border-orange-200',
          icon: Clock,
        };
      case 'ACCEPTED':
        return {
          label: t('assistance.history.status.accepted'),
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          icon: CheckCircle,
        };
      case 'REJECTED':
        return {
          label: t('assistance.history.status.rejected'),
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          icon: XCircle,
        };
      case 'SENT':
        return {
          label: t('assistance.history.status.sent'),
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          icon: Send,
        };
      case 'RESPONDED':
        return {
          label: t('assistance.history.status.responded'),
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-200',
          icon: MessageCircle,
        };
      default:
        return {
          label: status,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          icon: AlertCircle,
        };
    }
  };

  const getTypeConfig = (type: HistoryEntry['type']) => {
    switch (type) {
      case 'CONTACT':
        return {
          label: t('assistance.history.type.contact'),
          icon: MessageCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
        };
      case 'COLLABORATION':
        return {
          label: t('assistance.history.type.collaboration'),
          icon: Rocket,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
        };
      case 'INVITATION':
        return {
          label: t('assistance.history.type.invitation'),
          icon: Send,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
        };
    }
  };

  const filteredEntries = entries
    .filter((entry) => selectedFilter === 'ALL' || entry.type === selectedFilter)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(t('common.locale'), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('assistance.history.time.justNow');
    if (diffMins < 60) return t('assistance.history.time.minutesAgo').replace('{count}', diffMins.toString());
    if (diffHours < 24) return t('assistance.history.time.hoursAgo').replace('{count}', diffHours.toString());
    if (diffDays < 7) return t('assistance.history.time.daysAgo').replace('{count}', diffDays.toString());
    return formatDate(date);
  };

  const filterCounts = {
    ALL: entries.length,
    CONTACT: entries.filter((e) => e.type === 'CONTACT').length,
    COLLABORATION: entries.filter((e) => e.type === 'COLLABORATION').length,
    INVITATION: entries.filter((e) => e.type === 'INVITATION').length,
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border-b border-gray-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary">{t('assistance.history.title')}</h2>
              <p className="text-sm text-gray-600">{t('assistance.history.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {filteredEntries.length} {t('assistance.history.entries')}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'CONTACT', 'COLLABORATION', 'INVITATION'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedFilter === filter
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {filter === 'ALL' ? t('assistance.history.filter.all') : getTypeConfig(filter).label}
                  <span className="ml-2 text-xs opacity-75">({filterCounts[filter]})</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History Timeline */}
      <div className="p-5">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              {t('assistance.history.empty.title')}
            </h3>
            <p className="text-sm text-gray-500">
              {t('assistance.history.empty.message')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry, index) => {
              const statusConfig = getStatusConfig(entry.status);
              const typeConfig = getTypeConfig(entry.type);
              const StatusIcon = statusConfig.icon;
              const TypeIcon = typeConfig.icon;

              return (
                <div
                  key={entry.id}
                  className="relative border border-gray-200 rounded-lg"
                >
                  {/* Timeline Line */}
                  {index !== filteredEntries.length - 1 && (
                    <div className="absolute left-[2.75rem] top-16 w-0.5 h-[calc(100%+1rem)] bg-gray-200 -z-10" />
                  )}

                  {/* Entry Content */}
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Type Icon */}
                      <div className={`flex-shrink-0 w-11 h-11 ${typeConfig.bgColor} rounded-full flex items-center justify-center relative z-10`}>
                        <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center flex-wrap gap-2 mb-1">
                              <h3 className="font-semibold text-primary">{entry.targetName}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                                <StatusIcon className="w-3 h-3" />
                                {statusConfig.label}
                              </span>
                            </div>
                            {entry.targetRole && (
                              <p className="text-sm text-gray-600 flex items-center gap-1 mb-2">
                                <User className="w-3 h-3" />
                                {entry.targetRole}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1 whitespace-nowrap">
                            <Calendar className="w-3 h-3" />
                            {getRelativeTime(entry.date)}
                          </span>
                        </div>

                        {/* Type Badge */}
                        <div className="flex items-start gap-2 mb-3 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}>
                            {typeConfig.label}
                          </span>
                          {entry.subject && (
                            <span className="text-sm text-gray-600 flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {entry.subject}
                            </span>
                          )}
                        </div>

                        {/* Message Content */}
                        <div className="space-y-3">
                          {entry.message && (
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <p className="text-xs font-medium text-gray-500 mb-1 uppercase">
                                {t('assistance.history.yourMessage')}
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{formatDate(entry.date)}</p>
                            </div>
                          )}

                          {entry.responseMessage && (
                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                              <p className="text-xs font-medium text-blue-700 mb-1 uppercase">
                                {t('assistance.history.response')}
                              </p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{entry.responseMessage}</p>
                              {entry.responseDate && (
                                <p className="text-xs text-gray-500 mt-2">{formatDate(entry.responseDate)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}