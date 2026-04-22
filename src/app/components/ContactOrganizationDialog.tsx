import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Mail, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface ContactOrganizationDialogProps {
  open: boolean;
  onClose: () => void;
  onContactSent?: () => void; // Callback after contact is sent
  organization: {
    id: string;
    name: string;
    projectTitle?: string;
  } | null;
}

export function ContactOrganizationDialog({ open, onClose, onContactSent, organization }: ContactOrganizationDialogProps) {
  const { t } = useTranslation();
  
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const resetState = () => {
    setSubject('');
    setMessage('');
    setIsSending(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendMessage = async () => {
    if (!subject.trim() || !message.trim() || !organization) {
      toast.error(t('common.error'), {
        description: 'Please fill in all required fields',
      });
      return;
    }

    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      // Save to contact history
      try {
        const contactHistory = JSON.parse(localStorage.getItem('projectContactHistory') || '[]');
        contactHistory.push({
          projectId: organization.id,
          organizationName: organization.name,
          projectTitle: organization.projectTitle,
          date: new Date().toISOString(),
          subject,
          message,
        });
        localStorage.setItem('projectContactHistory', JSON.stringify(contactHistory));
      } catch (error) {
        console.error('Error saving contact history:', error);
      }

      toast.success(t('common.success'), {
        description: `Your message has been sent to ${organization.name}`,
      });

      resetState();
      if (onContactSent) {
        onContactSent();
      }
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#B82547]" />
            {t('projects.contact.title')}
          </DialogTitle>
        </DialogHeader>

        {organization && (
          <div className="space-y-4 py-4">
            {/* Organization Info */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-semibold text-primary">{organization.name}</div>
              {organization.projectTitle && (
                <div className="text-xs text-muted-foreground mt-1">
                  Re: {organization.projectTitle}
                </div>
              )}
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('projects.contact.subject')}</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={t('projects.contact.subjectPlaceholder')}
                disabled={isSending}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('projects.contact.message')}</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('projects.contact.messagePlaceholder')}
                rows={6}
                disabled={isSending}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSending}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                onClick={handleSendMessage}
                disabled={isSending || !subject.trim() || !message.trim()}
                className="flex-1 bg-[#B82547] hover:bg-[#9a1d3a]"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSending ? t('common.sending') : t('common.send')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}