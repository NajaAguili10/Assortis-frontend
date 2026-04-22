import { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAssistanceHistory } from '../contexts/AssistanceHistoryContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Mail, Send, X } from 'lucide-react';
import { toast } from 'sonner';

interface ContactDialogProps {
  open: boolean;
  onClose: () => void;
  expert: {
    id: string;
    name: string;
    role?: string;
  } | null;
}

export function ContactDialog({ open, onClose, expert }: ContactDialogProps) {
  const { t } = useTranslation();
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
    if (!subject.trim() || !message.trim() || !expert) {
      toast.error(t('common.error'), {
        description: t('assistance.contact.error.emptyFields'),
      });
      return;
    }

    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Ajouter l'entrée dans l'historique
    addHistoryEntry({
      type: 'contact',
      expertName: expert.name,
      expertRole: expert.role || 'Expert',
      title: subject,
      status: 'sent',
      message: message,
      isNew: false,
    });
    
    // Show success toast notification
    toast.success(t('assistance.contact.success.title'), {
      description: t('assistance.contact.success.message').replace('{name}', expert.name),
    });
    
    // Close dialog and reset state
    setIsSending(false);
    handleClose();
  };

  if (!expert) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-primary">
                  {t('assistance.contact.title')}
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600">
                  {t('assistance.contact.subtitle').replace('{name}', expert.name)}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-5 py-4">
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('assistance.contact.form.subject')}
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('assistance.contact.form.subjectPlaceholder')}
              className="w-full"
              disabled={isSending}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('assistance.contact.form.message')}
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t('assistance.contact.form.messagePlaceholder')}
              className="w-full min-h-[200px]"
              disabled={isSending}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length} / 2000 {t('common.characters')}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending}
          >
            <X className="w-4 h-4 mr-2" />
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !subject.trim() || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? t('common.sending') : t('assistance.contact.send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}