/**
 * Contact History Component
 * Displays contact history with traceability for job vacancies
 */

import React, { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { ContactHistoryListDTO, ContactHistoryDTO, ContactStatusEnum } from '../types/ContactHistory.dto';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { 
  Calendar, 
  Building2, 
  Mail, 
  Eye, 
  FileText,
  Clock,
  CheckCircle,
  Send,
  Archive,
  MessageCircle,
  Filter,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';

interface ContactHistoryProps {
  contacts: ContactHistoryListDTO[];
  onViewDetails: (contactId: string) => void;
}

export function ContactHistory({ contacts, onViewDetails }: ContactHistoryProps) {
  const { t, language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Get date-fns locale based on language
  const getLocale = () => {
    switch (language) {
      case 'fr':
        return fr;
      case 'es':
        return es;
      default:
        return enUS;
    }
  };

  // Filter contacts by status
  const filteredContacts = statusFilter === 'all' 
    ? contacts 
    : contacts.filter(c => c.status.toLowerCase() === statusFilter);

  // Format date display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: ContactStatusEnum) => {
    switch (status) {
      case ContactStatusEnum.SENT:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            <Send className="h-3 w-3 mr-1" />
            {t('monEspace.history.status.sent')}
          </Badge>
        );
      case ContactStatusEnum.DELIVERED:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('monEspace.history.status.delivered')}
          </Badge>
        );
      case ContactStatusEnum.READ:
        return (
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300">
            <Eye className="h-3 w-3 mr-1" />
            {t('monEspace.history.status.read')}
          </Badge>
        );
      case ContactStatusEnum.REPLIED:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <MessageCircle className="h-3 w-3 mr-1" />
            {t('monEspace.history.status.replied')}
          </Badge>
        );
      case ContactStatusEnum.ARCHIVED:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-400">
            <Archive className="h-3 w-3 mr-1" />
            {t('monEspace.history.status.archived')}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('monEspace.history.empty')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('monEspace.history.empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#3d4654]">
            {t('monEspace.history.title')}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {t('monEspace.history.description')}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder={t('monEspace.filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('monEspace.history.filter.all')}</SelectItem>
                <SelectItem value="sent">{t('monEspace.history.filter.sent')}</SelectItem>
                <SelectItem value="read">{t('monEspace.history.filter.read')}</SelectItem>
                <SelectItem value="replied">{t('monEspace.history.filter.replied')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-gray-500">
            {filteredContacts.length} {t('monEspace.history.totalContacts')}
          </div>
        </div>
      </div>

      {/* Contact History Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('monEspace.history.contactDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('monEspace.history.position')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('monEspace.history.organization')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('monEspace.history.subject')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('monEspace.history.status')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('monEspace.history.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                    {t('monEspace.message.noResults')}
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        {formatDate(contact.contactDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.jobOfferTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        {contact.organizationName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {contact.subject}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {contact.messageExcerpt}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(contact.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(contact.id)}
                        className="text-[#B82547] hover:text-[#8B1835] hover:bg-red-50"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {t('monEspace.history.viewDetails')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

interface ContactHistoryDetailDialogProps {
  open: boolean;
  onClose: () => void;
  contact: ContactHistoryDTO | null;
}

export function ContactHistoryDetailDialog({
  open,
  onClose,
  contact,
}: ContactHistoryDetailDialogProps) {
  const { t, language } = useLanguage();

  // Get date-fns locale based on language
  const getLocale = () => {
    switch (language) {
      case 'fr':
        return fr;
      case 'es':
        return es;
      default:
        return enUS;
    }
  };

  // Format date display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: getLocale() });
    } catch {
      return dateString;
    }
  };

  if (!contact) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#3d4654]">
            {t('monEspace.history.details.title')}
          </DialogTitle>
          <DialogDescription>
            {contact.subject}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contact Information */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-gray-50">
              <div className="text-sm font-medium text-gray-500 mb-1">
                {t('monEspace.history.position')}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {contact.jobOfferTitle}
              </div>
            </Card>

            <Card className="p-4 bg-gray-50">
              <div className="text-sm font-medium text-gray-500 mb-1">
                {t('monEspace.history.organization')}
              </div>
              <div className="text-sm font-semibold text-gray-900 flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {contact.organizationName}
              </div>
            </Card>
          </div>

          {/* Sender & Recipient */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                {t('monEspace.history.details.sender')}
              </div>
              <div className="text-sm text-gray-900">{contact.senderName}</div>
              <div className="text-xs text-gray-500">{contact.senderEmail}</div>
            </div>

            {contact.recipientEmail && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {t('monEspace.history.details.recipient')}
                </div>
                <div className="text-xs text-gray-500">{contact.recipientEmail}</div>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">
                {t('monEspace.history.details.sentOn')}
              </div>
              <div className="text-sm text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                {formatDate(contact.contactDate)}
              </div>
            </div>

            {contact.readDate && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {t('monEspace.history.details.readOn')}
                </div>
                <div className="text-sm text-gray-900 flex items-center">
                  <Eye className="h-4 w-4 mr-1 text-indigo-500" />
                  {formatDate(contact.readDate)}
                </div>
              </div>
            )}

            {contact.replyDate && (
              <div>
                <div className="text-sm font-medium text-gray-500 mb-1">
                  {t('monEspace.history.details.repliedOn')}
                </div>
                <div className="text-sm text-gray-900 flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1 text-green-500" />
                  {formatDate(contact.replyDate)}
                </div>
              </div>
            )}
          </div>

          {/* Original Message */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              {t('monEspace.history.details.originalMessage')}
            </div>
            <Card className="p-4 bg-gray-50">
              <p className="text-sm text-gray-900 whitespace-pre-wrap">
                {contact.message}
              </p>
            </Card>
          </div>

          {/* Reply */}
          {contact.replyMessage ? (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MessageCircle className="h-4 w-4 mr-1 text-green-600" />
                {t('monEspace.history.details.reply')}
              </div>
              <Card className="p-4 bg-green-50 border-green-200">
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {contact.replyMessage}
                </p>
              </Card>
            </div>
          ) : (
            <div className="text-center py-4">
              <Mail className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                {t('monEspace.history.details.noReply')}
              </p>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose} className="bg-[#3d4654] hover:bg-[#2d3644] text-white">
              {t('monEspace.history.details.close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
