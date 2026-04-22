import { useState } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAssistanceHistory } from '../../../contexts/AssistanceHistoryContext';
import { addContactToHistory } from '../services/contactHistoryService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Mail, Loader2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

interface JobContactDialogProps {
  open: boolean;
  onClose: () => void;
  jobOffer: {
    id: string;
    jobTitle: string;
    organizationName?: string;
  } | null;
  onContactSent?: () => void; // Callback to refresh contact history
}

export function JobContactDialog({ open, onClose, jobOffer, onContactSent }: JobContactDialogProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { addHistoryEntry } = useAssistanceHistory();
  
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
    if (!subject.trim() || !message.trim() || !jobOffer) {
      toast.error(t('monEspace.contact.error.title'), {
        description: t('monEspace.contact.error.emptyFields'),
      });
      return;
    }

    setIsSending(true);
    
    // Simulate API call for email and notification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add contact to Assistance/Historique via AssistanceHistoryContext
    addHistoryEntry({
      type: 'contact',
      organizationName: jobOffer.organizationName || 'N/A',
      title: subject,
      status: 'sent',
      message: message,
      date: new Date(),
    });
    
    // Add contact to local Mon Espace history
    if (user) {
      await addContactToHistory(
        jobOffer.id,
        jobOffer.jobTitle,
        jobOffer.organizationName || 'N/A',
        subject,
        message,
        user.name || 'Anonymous',
        user.email || 'no-email@example.com'
      );
    }
    
    // Show success toast notification
    toast.success(t('monEspace.contact.success.title'), {
      description: t('monEspace.contact.success.message'),
    });
    
    // Close dialog and reset state
    setIsSending(false);
    handleClose();
    if (onContactSent) {
      onContactSent();
    }
  };

  if (!jobOffer) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#B82547]" />
            {t('monEspace.contact.title')}
          </DialogTitle>
          <DialogDescription>
            {t('monEspace.contact.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-primary">
              {jobOffer.jobTitle}
            </h4>
            {jobOffer.organizationName && (
              <p className="text-sm text-muted-foreground">{jobOffer.organizationName}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('monEspace.contact.form.subject')}
            </label>
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('monEspace.contact.form.subjectPlaceholder')}
              disabled={isSending}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('monEspace.contact.form.message')}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('monEspace.contact.form.messagePlaceholder')}
              rows={5}
              disabled={isSending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            {t('monEspace.action.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={isSending || !subject.trim() || !message.trim()}
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('monEspace.contact.button.sending')}
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                {t('monEspace.contact.button.send')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}