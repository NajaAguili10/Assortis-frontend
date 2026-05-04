import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { canManageOrganizationAdminActions } from '@app/services/permissions.service';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Avatar, AvatarFallback } from '@app/components/ui/avatar';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { ScrollArea } from '@app/components/ui/scroll-area';
import { Separator } from '@app/components/ui/separator';
import { Textarea } from '@app/components/ui/textarea';
import {
  ArrowUpRight,
  Building2,
  ChevronLeft,
  Lock,
  MessageSquareText,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';

type ThreadCategory = 'organisation' | 'private';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAdmin?: boolean;
}

interface MessageThread {
  id: string;
  category: ThreadCategory;
  title: string;
  subtitle: string;
  messages: ChatMessage[];
}

const ORGANISATION_THREADS_KEY = 'account.messages.organisation.v1';
const PRIVATE_THREADS_KEY_PREFIX = 'account.messages.private.v1.';

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const createOrganisationThreads = (): MessageThread[] => [
  {
    id: 'organisation-announcements',
    category: 'organisation',
    title: 'Organisation Announcements',
    subtitle: 'Global updates from admins',
    messages: [
      {
        id: 'org-msg-1',
        senderId: 'admin-team',
        senderName: 'Admin team',
        text: 'Welcome to the organisation channel. Key updates and responses from admins will appear here.',
        timestamp: hoursAgo(30),
        isAdmin: true,
      },
      {
        id: 'org-msg-2',
        senderId: 'admin-team',
        senderName: 'Admin team',
        text: 'Please keep your project details current so matching and reporting stay accurate.',
        timestamp: hoursAgo(8),
        isAdmin: true,
      },
    ],
  },
  {
    id: 'organisation-operations',
    category: 'organisation',
    title: 'Operations Desk',
    subtitle: 'Shared process notes',
    messages: [
      {
        id: 'org-msg-3',
        senderId: 'admin-team',
        senderName: 'Operations admin',
        text: 'Reference requests and organization-wide notices are tracked here for visibility.',
        timestamp: hoursAgo(18),
        isAdmin: true,
      },
    ],
  },
];

const createPrivateThreads = (firstName: string): MessageThread[] => [
  {
    id: 'private-support',
    category: 'private',
    title: 'Support Coordinator',
    subtitle: 'Private conversation',
    messages: [
      {
        id: 'private-msg-1',
        senderId: 'support-coordinator',
        senderName: 'Support Coordinator',
        text: `Hi ${firstName || 'there'}, let us know if you need help with your account or project setup.`,
        timestamp: hoursAgo(14),
      },
    ],
  },
  {
    id: 'private-project-desk',
    category: 'private',
    title: 'Project Desk',
    subtitle: 'Private conversation',
    messages: [
      {
        id: 'private-msg-2',
        senderId: 'project-desk',
        senderName: 'Project Desk',
        text: 'You can use this chat to follow up on project-specific questions.',
        timestamp: hoursAgo(4),
      },
    ],
  },
];

const readThreads = (key: string, fallback: MessageThread[]) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }

    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed as MessageThread[] : fallback;
  } catch {
    return fallback;
  }
};

const writeThreads = (key: string, value: MessageThread[]) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const appendMessageToThread = (
  threads: MessageThread[],
  threadId: string,
  message: ChatMessage,
) => threads.map((thread) => (
  thread.id === threadId
    ? { ...thread, messages: [...thread.messages, message] }
    : thread
));

const formatTime = (timestamp: string) => (
  new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
);

const formatListTime = (timestamp: string) => (
  new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(new Date(timestamp))
);

const formatDayLabel = (timestamp: string) => {
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const messageDayKey = messageDate.toDateString();
  if (messageDayKey === today.toDateString()) {
    return 'Today';
  }

  if (messageDayKey === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(messageDate);
};

const getInitials = (name: string) => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'MS'
);

const getLastMessage = (thread: MessageThread) => thread.messages[thread.messages.length - 1];

const getPrivateAutoReply = (threadTitle: string) => {
  if (threadTitle === 'Project Desk') {
    return 'Thanks, we have noted this and will keep the project follow-up moving.';
  }

  return 'Thanks for your message. We will come back to you here shortly.';
};

export default function AccountMessagesPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const timerIdsRef = useRef<number[]>([]);
  const isAdmin = canManageOrganizationAdminActions(user?.accountType, user?.role);
  const privateStorageKey = `${PRIVATE_THREADS_KEY_PREFIX}${user?.id ?? 'guest'}`;

  const [organisationThreads, setOrganisationThreads] = useState<MessageThread[]>([]);
  const [privateThreads, setPrivateThreads] = useState<MessageThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  useEffect(() => {
    const nextOrganisationThreads = readThreads(ORGANISATION_THREADS_KEY, createOrganisationThreads());
    const nextPrivateThreads = readThreads(
      privateStorageKey,
      createPrivateThreads(user?.firstName ?? 'there'),
    );

    setOrganisationThreads(nextOrganisationThreads);
    setPrivateThreads(nextPrivateThreads);
  }, [privateStorageKey, user?.firstName]);

  useEffect(() => {
    if (organisationThreads.length) {
      writeThreads(ORGANISATION_THREADS_KEY, organisationThreads);
    }
  }, [organisationThreads]);

  useEffect(() => {
    if (privateThreads.length) {
      writeThreads(privateStorageKey, privateThreads);
    }
  }, [privateStorageKey, privateThreads]);

  useEffect(() => (
    () => {
      timerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    }
  ), []);

  const allThreads = useMemo(
    () => [...organisationThreads, ...privateThreads],
    [organisationThreads, privateThreads],
  );

  useEffect(() => {
    if (!allThreads.length) {
      setActiveThreadId('');
      return;
    }

    if (!activeThreadId || !allThreads.some((thread) => thread.id === activeThreadId)) {
      setActiveThreadId(allThreads[0].id);
    }
  }, [activeThreadId, allThreads]);

  const activeThread = allThreads.find((thread) => thread.id === activeThreadId) ?? null;
  const activeDraft = activeThreadId ? drafts[activeThreadId] ?? '' : '';
  const isOrganisationThread = activeThread?.category === 'organisation';
  const canReply = Boolean(activeThread) && (!isOrganisationThread || isAdmin);
  const organisationCount = organisationThreads.length;
  const privateCount = privateThreads.length;

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setMobileChatOpen(true);
  };

  const handleSendMessage = () => {
    if (!activeThread || !canReply) {
      return;
    }

    const nextText = activeDraft.trim();
    if (!nextText) {
      return;
    }

    const senderName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || 'You';
    const outgoingMessage: ChatMessage = {
      id: `${activeThread.id}-${Date.now()}`,
      senderId: user?.id ?? 'current-user',
      senderName,
      text: nextText,
      timestamp: new Date().toISOString(),
      isAdmin: isOrganisationThread ? isAdmin : false,
    };

    if (isOrganisationThread) {
      setOrganisationThreads((currentThreads) => appendMessageToThread(currentThreads, activeThread.id, outgoingMessage));
    } else {
      setPrivateThreads((currentThreads) => appendMessageToThread(currentThreads, activeThread.id, outgoingMessage));

      const replyTimerId = window.setTimeout(() => {
        const autoReply: ChatMessage = {
          id: `${activeThread.id}-reply-${Date.now()}`,
          senderId: activeThread.id,
          senderName: activeThread.title,
          text: getPrivateAutoReply(activeThread.title),
          timestamp: new Date().toISOString(),
        };

        setPrivateThreads((currentThreads) => appendMessageToThread(currentThreads, activeThread.id, autoReply));
      }, 900);

      timerIdsRef.current.push(replyTimerId);
    }

    setDrafts((currentDrafts) => ({
      ...currentDrafts,
      [activeThread.id]: '',
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        icon={MessageSquareText}
        title={t('account.messages.title')}
        description={t('account.messages.subtitle')}
      />

      <PageContainer className="my-4 overflow-hidden rounded-2xl border border-slate-200 shadow-sm sm:my-6">
        <div className="grid min-h-[72vh] grid-cols-1 bg-slate-50 md:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className={`${mobileChatOpen ? 'hidden md:flex' : 'flex'} min-h-0 flex-col border-r border-slate-200 bg-white`}>
            <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-foreground">{t('account.messages.inbox')}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{t('account.messages.inboxDescription')}</p>
                </div>
                <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {allThreads.length}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5" />
                    <span>{t('account.messages.organisationLabel')}</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-foreground">{organisationCount}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                    <UserRound className="h-3.5 w-3.5" />
                    <span>{t('account.messages.privateLabel')}</span>
                  </div>
                  <p className="mt-2 text-xl font-semibold text-foreground">{privateCount}</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-6 p-3 sm:p-4">
                {[
                  {
                    id: 'organisation',
                    icon: Building2,
                    label: t('account.messages.organisationSection'),
                    threads: organisationThreads,
                  },
                  {
                    id: 'private',
                    icon: UserRound,
                    label: t('account.messages.privateSection'),
                    threads: privateThreads,
                  },
                ].map((section) => (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 px-2">
                      <div className="flex items-center gap-2">
                        <section.icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {section.label}
                        </h3>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        {section.threads.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {section.threads.map((thread) => {
                        const lastMessage = getLastMessage(thread);
                        const isActive = thread.id === activeThreadId;

                        return (
                          <button
                            key={thread.id}
                            type="button"
                            onClick={() => handleSelectThread(thread.id)}
                            className={`group w-full rounded-2xl border p-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:p-4 ${
                              isActive
                                ? 'border-primary/30 bg-primary/[0.06] shadow-sm ring-1 ring-primary/10'
                                : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <Avatar className="mt-0.5 h-11 w-11 shrink-0">
                                <AvatarFallback className={thread.category === 'organisation' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'}>
                                  {getInitials(thread.title)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start gap-2">
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                      <p className="truncate text-sm font-semibold text-foreground">{thread.title}</p>
                                      {isActive && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                          Active
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{thread.subtitle}</p>
                                  </div>
                                  {lastMessage && (
                                    <span className="shrink-0 text-[11px] text-muted-foreground">
                                      {formatListTime(lastMessage.timestamp)}
                                    </span>
                                  )}
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <Badge variant="outline" className="border-slate-200 bg-white text-[11px]">
                                    {thread.category === 'organisation'
                                      ? t('account.messages.organisationLabel')
                                      : t('account.messages.privateLabel')}
                                  </Badge>
                                  {thread.category === 'organisation' && !isAdmin && (
                                    <Badge variant="secondary" className="text-[11px]">
                                      {t('account.messages.readOnlyShort')}
                                    </Badge>
                                  )}
                                  {thread.category === 'private' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                                      <Sparkles className="h-3 w-3" />
                                      Direct
                                    </span>
                                  )}
                                </div>

                                {lastMessage && (
                                  <div className="mt-3 flex items-start gap-2">
                                    <p className="line-clamp-2 flex-1 text-sm leading-5 text-muted-foreground">
                                      {lastMessage.text}
                                    </p>
                                    <ArrowUpRight className={`h-4 w-4 shrink-0 transition-opacity ${isActive ? 'opacity-100 text-primary' : 'opacity-0 text-slate-400 group-hover:opacity-100'}`} />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </aside>

          <section className={`${mobileChatOpen ? 'flex' : 'hidden md:flex'} min-h-0 flex-col bg-[linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]`}>
            {activeThread ? (
              <>
                <div className="border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-5">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="md:hidden"
                      onClick={() => setMobileChatOpen(false)}
                      aria-label={t('account.messages.back')}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <Avatar className="h-11 w-11">
                      <AvatarFallback className={activeThread.category === 'organisation' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'}>
                        {getInitials(activeThread.title)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-semibold text-foreground sm:text-base">{activeThread.title}</h2>
                        <Badge variant="outline" className="border-slate-200 bg-white">
                          {activeThread.category === 'organisation'
                            ? t('account.messages.organisationLabel')
                            : t('account.messages.privateLabel')}
                        </Badge>
                        {isOrganisationThread && !isAdmin && (
                          <Badge variant="secondary" className="text-[11px]">
                            {t('account.messages.readOnlyShort')}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">{activeThread.subtitle}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {activeThread.messages.length} messages
                    </div>
                    <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {canReply ? 'Reply enabled' : 'Read only'}
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 px-3 py-4 sm:px-5">
                  <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                    {activeThread.messages.map((message, index) => {
                      const isCurrentUser = message.senderId === (user?.id ?? 'current-user');
                      const isAdminMessage = activeThread.category === 'organisation' && message.isAdmin;
                      const previousMessage = activeThread.messages[index - 1];
                      const showDateChip = !previousMessage || formatDayLabel(previousMessage.timestamp) !== formatDayLabel(message.timestamp);

                      return (
                        <div key={message.id} className="space-y-3">
                          {showDateChip && (
                            <div className="flex justify-center">
                              <span className="rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-medium text-slate-500 shadow-sm">
                                {formatDayLabel(message.timestamp)}
                              </span>
                            </div>
                          )}

                          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[92%] sm:max-w-[75%] ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div
                                className={`rounded-[20px] px-4 py-3 shadow-sm ${
                                  isCurrentUser
                                    ? 'bg-primary text-primary-foreground'
                                    : 'border border-slate-200 bg-white text-foreground'
                                }`}
                              >
                                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                  <span className={`text-xs font-medium ${isCurrentUser ? 'text-primary-foreground/85' : 'text-muted-foreground'}`}>
                                    {message.senderName}
                                  </span>
                                  {isAdminMessage && !isCurrentUser && (
                                    <Badge variant="secondary" className="gap-1 text-[10px]">
                                      <ShieldCheck className="h-3 w-3" />
                                      {t('account.messages.adminBadge')}
                                    </Badge>
                                  )}
                                </div>
                                <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
                              </div>
                              <div className="mt-1 flex items-center gap-2 px-1 text-[11px] text-muted-foreground">
                                <span>{formatTime(message.timestamp)}</span>
                                {isCurrentUser && <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">You</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>

                <div className="border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur sm:px-5 sm:py-4">
                  {canReply ? (
                    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                        <Textarea
                          value={activeDraft}
                          onChange={(event) => setDrafts((currentDrafts) => ({
                            ...currentDrafts,
                            [activeThread.id]: event.target.value,
                          }))}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                              event.preventDefault();
                              handleSendMessage();
                            }
                          }}
                          placeholder={isOrganisationThread
                            ? t('account.messages.organisationPlaceholder')
                            : t('account.messages.privatePlaceholder')}
                          className="min-h-[88px] border-0 bg-transparent px-2 py-2 shadow-none focus-visible:ring-0"
                        />
                        <Separator className="my-1" />
                        <div className="flex flex-col gap-2 px-1 pb-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-xs text-muted-foreground">
                            Press Enter to send, Shift + Enter for a new line.
                          </p>
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              onClick={handleSendMessage}
                              disabled={!activeDraft.trim()}
                              className="w-full sm:w-auto"
                            >
                              <Send className="h-4 w-4" />
                              {t('account.messages.send')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mx-auto w-full max-w-4xl">
                      <div className="flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4">
                        <Lock className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">{t('account.messages.readOnlyTitle')}</p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {t('account.messages.readOnlyDescription')}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center px-6 text-center">
                <div className="max-w-sm space-y-3 rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
                  <MessageSquareText className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h2 className="text-base font-semibold text-foreground">{t('account.messages.emptyTitle')}</h2>
                  <p className="text-sm leading-6 text-muted-foreground">{t('account.messages.emptyDescription')}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </div>
  );
}
