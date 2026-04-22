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
import { Badge } from './ui/badge';
import { UserPlus, Send, X, Calendar, DollarSign, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ExpertInviteDialogProps {
  open: boolean;
  onClose: () => void;
  expertName: string;
  expertId: string;
  expertPhoto: string;
  expertTitle: string;
}

export function ExpertInviteDialog({ 
  open, 
  onClose, 
  expertName, 
  expertId,
  expertPhoto,
  expertTitle 
}: ExpertInviteDialogProps) {
  const { t } = useTranslation();
  const { addHistoryEntry } = useAssistanceHistory();
  
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isSending, setIsSending] = useState(false);

  const resetState = () => {
    setProjectTitle('');
    setDescription('');
    setRole('');
    setDuration('');
    setBudget('');
    setStartDate('');
    setIsSending(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSendInvitation = async () => {
    if (!projectTitle.trim() || !description.trim() || !role.trim()) {
      toast.error(t('common.error'), {
        description: t('assistance.invite.error.requiredFields'),
      });
      return;
    }

    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // ✅ Enregistrer dans l'historique
    addHistoryEntry({
      type: 'invitation',
      expertName: expertName,
      expertRole: expertTitle,
      projectName: projectTitle,
      title: `${t('assistance.invite.title')} - ${projectTitle}`,
      message: `${t('assistance.invite.form.role')}: ${role}\n\n${description}\n\n${duration ? `${t('assistance.invite.form.duration')}: ${duration}` : ''}${budget ? `\n${t('assistance.invite.form.budget')}: ${budget}` : ''}${startDate ? `\n${t('assistance.invite.form.startDate')}: ${startDate}` : ''}`,
      status: 'sent',
    });
    
    // Show success toast notification
    toast.success(t('assistance.invite.success.title'), {
      description: t('assistance.invite.success.message').replace('{name}', expertName),
    });
    
    // Close dialog and reset state
    setIsSending(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader>
          <div className="flex items-start gap-4 pb-4 border-b">
            <img 
              src={expertPhoto} 
              alt={expertName}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-primary mb-1">
                {t('assistance.invite.title')}
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600">
                {t('assistance.invite.subtitle').replace('{name}', expertName)}
              </DialogDescription>
              <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                {expertTitle}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-5 py-4">
          {/* Project Title */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {t('assistance.invite.form.projectTitle')}
              <span className="text-red-500">*</span>
            </label>
            <Input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder={t('assistance.invite.form.projectTitlePlaceholder')}
              className="w-full"
              disabled={isSending}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {t('assistance.invite.form.role')}
              <span className="text-red-500">*</span>
            </label>
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder={t('assistance.invite.form.rolePlaceholder')}
              className="w-full"
              disabled={isSending}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-primary mb-2">
              {t('assistance.invite.form.description')}
              <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('assistance.invite.form.descriptionPlaceholder')}
              className="w-full min-h-[150px]"
              disabled={isSending}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length} / 1000 {t('common.characters')}
            </p>
          </div>

          {/* Grid: Duration, Budget, Start Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('assistance.invite.form.duration')}
              </label>
              <Input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t('assistance.invite.form.durationPlaceholder')}
                className="w-full"
                disabled={isSending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {t('assistance.invite.form.budget')}
              </label>
              <Input
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder={t('assistance.invite.form.budgetPlaceholder')}
                className="w-full"
                disabled={isSending}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t('assistance.invite.form.startDate')}
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
                disabled={isSending}
              />
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-medium">{t('common.note')}:</span> {t('assistance.invite.form.note')}
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
            onClick={handleSendInvitation}
            disabled={isSending || !projectTitle.trim() || !description.trim() || !role.trim()}
            className="bg-primary hover:bg-red-700"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? t('common.sending') : t('assistance.invite.send')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}