import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { TendersSubMenu } from '@app/components/TendersSubMenu';
import { AccountSubMenu } from '@app/components/AccountSubMenu';
import { Button } from '@app/components/ui/button';
import { Textarea } from '@app/components/ui/textarea';
import { Badge } from '@app/components/ui/badge';
import { Separator } from '@app/components/ui/separator';
import { InvitationStatusEnum, SectorEnum } from '@app/types/tender.dto';
import { toast } from 'sonner';
import {
  MessageSquare,
  Send,
  ArrowLeft,
  Building,
  Calendar,
  FileText,
  User,
  Clock,
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'organization';
  content: string;
  timestamp: Date;
}

export default function InvitationMessaging() {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Détecter si on est dans Mon Espace
  const isAccountSection = location.pathname.startsWith('/account') || location.pathname.startsWith('/compte-utilisateur');

  const invitation = {
    id: invitationId,
    tenderId: 'tender-7',
    tenderTitle: 'Youth Employment and Skills Development',
    tenderReference: 'ILO-2024-YTH-008',
    organizationName: 'International Labour Organization',
    invitedAt: new Date('2024-02-10'),
    expiresAt: new Date('2024-02-25'),
    status: InvitationStatusEnum.ACCEPTED,
    budget: { amount: 450000, currency: 'USD' as const, formatted: '$450,000' },
    deadline: new Date('2024-03-15'),
    sectors: [SectorEnum.YOUTH, SectorEnum.EDUCATION],
    matchScore: 95,
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'org-1',
      senderName: 'International Labour Organization',
      senderType: 'organization',
      content: 'Thank you for accepting our invitation. We are excited to work with you on this project. Please let us know if you have any questions about the Terms of Reference.',
      timestamp: new Date('2024-02-11T10:30:00'),
    },
    {
      id: '2',
      senderId: 'user-1',
      senderName: 'You',
      senderType: 'user',
      content: 'Thank you for the opportunity. I have reviewed the ToR and have a few questions about the project timeline and deliverables. Could we schedule a call to discuss?',
      timestamp: new Date('2024-02-11T14:15:00'),
    },
    {
      id: '3',
      senderId: 'org-1',
      senderName: 'International Labour Organization',
      senderType: 'organization',
      content: 'Of course! We can arrange a video call next week. What days work best for you? Also, please send us your availability.',
      timestamp: new Date('2024-02-12T09:00:00'),
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast.error(t('invitations.messaging.empty'));
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'user-1',
      senderName: 'You',
      senderType: 'user',
      content: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    toast.success(t('invitations.messaging.sent'));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    const diffInDays = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return `${t('invitations.messaging.today')} ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return `${t('invitations.messaging.yesterday')} ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return messageDate.toLocaleDateString() + ' ' + messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={t('dashboard.title')}
        description={t('dashboard.subtitle')}
        icon={FileText}
        stats={[
          { value: messages.length.toString(), label: t('invitations.messaging.messages') }
        ]}
      />

      {isAccountSection
        ? <AccountSubMenu activeTab="invitations" onTabChange={() => undefined} mode="profile-settings" />
        : <TendersSubMenu />}

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(
                isAccountSection 
                  ? '/compte-utilisateur/invitations' 
                  : '/invitations'
              )}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('invitations.messaging.backToInvitations')}
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-bold text-primary">
                    {invitation.tenderTitle}
                  </h2>
                  <Badge className="bg-green-100 text-green-800">
                    {t('invitations.status.accepted')}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {invitation.organizationName}
                  </span>
                  <span>•</span>
                  <span>{invitation.tenderReference}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {invitation.sectors.map((sector) => (
                    <Badge key={sector} variant="outline" className="text-xs">
                      {t(`sectors.${sector}`)}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary mb-1">
                  {invitation.budget.formatted}
                </div>
                <div className="text-sm text-gray-600">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {t('invitations.deadline', {
                    date: invitation.deadline.toLocaleDateString(),
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    {t('invitations.messaging.title', { organization: invitation.organizationName })}
                  </h3>
                  <p className="text-sm text-gray-600">{t('invitations.messaging.subtitle')}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 h-[500px] overflow-y-auto bg-gray-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('invitations.messaging.noMessages')}
                  </h3>
                  <p className="text-gray-600">{t('invitations.messaging.noMessagesDescription')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] sm:max-w-[65%] ${
                          message.senderType === 'user'
                            ? 'bg-accent text-white'
                            : 'bg-white border border-gray-200'
                        } rounded-lg p-4 shadow-sm`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {message.senderType === 'organization' && (
                            <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center">
                              <Building className="w-3 h-3 text-blue-600" />
                            </div>
                          )}
                          {message.senderType === 'user' && (
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-white" />
                            </div>
                          )}
                          <span
                            className={`text-xs font-semibold ${
                              message.senderType === 'user' ? 'text-white/90' : 'text-gray-700'
                            }`}
                          >
                            {message.senderType === 'user'
                              ? t('invitations.messaging.you')
                              : message.senderName}
                          </span>
                        </div>
                        <p
                          className={`text-sm mb-2 ${
                            message.senderType === 'user' ? 'text-white' : 'text-gray-800'
                          }`}
                        >
                          {message.content}
                        </p>
                        <div
                          className={`flex items-center gap-1 text-xs ${
                            message.senderType === 'user' ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{formatMessageTime(message.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="bg-white border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <Textarea
                    placeholder={t('invitations.messaging.placeholder')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    rows={3}
                    className="resize-none w-full"
                  />
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t('invitations.messaging.send')}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}