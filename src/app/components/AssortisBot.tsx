import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Bot,
  X,
  Minimize2,
  Send,
  Loader2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actions?: Array<{
    label: string;
    path: string;
  }>;
}

export function AssortisBot() {
  const { t } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        type: 'bot',
        content: isAuthenticated && user?.name
          ? t('chatbot.welcome.authenticated', { name: user.name })
          : isAuthenticated
          ? t('chatbot.welcome.greeting') + '\n' + t('chatbot.welcome.message')
          : t('chatbot.welcome.greeting') + '\n' + t('chatbot.welcome.guest'),
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isAuthenticated, user, t, messages.length]);

  // Quick suggestions based on user type
  const getQuickSuggestions = () => {
    if (!isAuthenticated) {
      return [
        t('chatbot.suggestions.createAccount'),
        t('chatbot.suggestions.findTenders'),
        t('chatbot.suggestions.becomeExpert'),
      ];
    }
    
    return [
      t('chatbot.suggestions.joinOrganization'),
      t('chatbot.suggestions.publishRequest'),
      t('chatbot.suggestions.manageProfile'),
      t('chatbot.suggestions.subscription'),
    ];
  };

  // Mock AI response handler
  const handleBotResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    let botResponse = '';
    let actions: Array<{ label: string; path: string }> | undefined = undefined;

    // Simple pattern matching for demo
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('compte') || lowerMessage.includes('account') || lowerMessage.includes('cuenta')) {
      botResponse = t('chatbot.response.createAccount');
      actions = [
        { label: t('chatbot.action.signup'), path: '/signup' },
      ];
    } else if (lowerMessage.includes('organisation') || lowerMessage.includes('organization') || lowerMessage.includes('organización')) {
      botResponse = t('chatbot.response.joinOrganization');
      if (isAuthenticated) {
        actions = [
          { label: t('chatbot.action.createOrganization'), path: '/organizations/create-profile' },
          { label: t('chatbot.action.viewInvitations'), path: '/organizations/invitations' },
        ];
      }
    } else if (lowerMessage.includes('expert') || lowerMessage.includes('experto')) {
      botResponse = t('chatbot.response.becomeExpert');
      if (!isAuthenticated) {
        actions = [
          { label: t('chatbot.action.signup'), path: '/signup' },
        ];
      } else {
        actions = [
          { label: t('chatbot.action.goToProfile'), path: '/account' },
        ];
      }
    } else if (lowerMessage.includes('publier') || lowerMessage.includes('publish') || lowerMessage.includes('publicar')) {
      botResponse = t('chatbot.response.publishRequest');
      if (isAuthenticated) {
        actions = [
          { label: t('chatbot.action.goToProfile'), path: '/mon-espace/publier' },
        ];
      } else {
        botResponse = t('chatbot.response.guestLimited');
        actions = [
          { label: t('chatbot.action.login'), path: '/login' },
        ];
      }
    } else if (lowerMessage.includes('profil') || lowerMessage.includes('profile') || lowerMessage.includes('perfil')) {
      if (isAuthenticated) {
        botResponse = t('chatbot.response.profileInfo');
        actions = [
          { label: t('chatbot.action.goToProfile'), path: '/account' },
        ];
      } else {
        botResponse = t('chatbot.response.guestLimited');
        actions = [
          { label: t('chatbot.action.login'), path: '/login' },
        ];
      }
    } else if (lowerMessage.includes('appel') || lowerMessage.includes('tender') || lowerMessage.includes('licitación')) {
      botResponse = t('chatbot.response.tendersInfo');
      actions = [
        { label: t('chatbot.action.browseTenders'), path: '/calls' },
      ];
    } else {
      botResponse = t('chatbot.response.fallback');
    }

    const botMessage: Message = {
      id: `bot-${Date.now()}`,
      type: 'bot',
      content: botResponse,
      timestamp: new Date(),
      actions,
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
    
    // Show notification badge if chat is closed
    if (!isOpen) {
      setHasNewMessage(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    await handleBotResponse(userMessage.content);
  };

  const handleQuickSuggestion = async (suggestion: string) => {
    setInputValue(suggestion);
    // Auto-send after short delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleCopyMessage = async (messageId: string, content: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(content);
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        // Fallback to legacy method
        fallbackCopyTextToClipboard(content, messageId);
      }
    } catch (error) {
      // If Clipboard API fails (permissions issue), use fallback silently
      fallbackCopyTextToClipboard(content, messageId);
    }
  };

  const fallbackCopyTextToClipboard = (text: string, messageId: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Make the textarea invisible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopiedId(messageId);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch (err) {
      // Silently fail - copy feature not critical
    }
    
    document.body.removeChild(textArea);
  };

  const handleActionClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return t('chatbot.message.timestamp', { time: '0min' });
    if (diffInMinutes < 60) return t('chatbot.message.timestamp', { time: `${diffInMinutes}min` });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('chatbot.message.timestamp', { time: `${diffInHours}h` });
    
    return date.toLocaleDateString();
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={toggleChat}
              size="lg"
              className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all relative"
              title={t('chatbot.widget.tooltip')}
            >
              <Bot className="h-6 w-6 text-white" />
              {hasNewMessage && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop - Click to close */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90] cursor-pointer"
            onClick={() => setIsOpen(false)}
            aria-label="Close chat"
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-[100] w-full max-w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 bottom-6 right-6 max-sm:bottom-0 max-sm:right-0 max-sm:left-0 max-sm:top-0 max-sm:max-w-full max-sm:h-full max-sm:rounded-none max-sm:max-h-full cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex items-center justify-between flex-shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {t('chatbot.header.title')}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 bg-green-400 rounded-full"></span>
                    <span className="text-white/90 text-xs">{t('chatbot.header.online')}</span>
                    <Sparkles className="h-3 w-3 text-yellow-300 ml-1" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 relative z-20">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 cursor-pointer transition-all hover:scale-110"
                  title={t('chatbot.header.minimize')}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white hover:bg-white/20 hover:bg-red-500/30 cursor-pointer transition-all hover:scale-110"
                  title={t('chatbot.header.close')}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
              <div className="space-y-4 pb-2">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.type === 'user'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-gray-100 text-gray-900 rounded-2xl rounded-tl-sm'
                      } px-4 py-2.5 shadow-sm`}
                    >
                      <p className="text-sm whitespace-pre-line leading-relaxed">
                        {message.content}
                      </p>
                      
                      {/* Action Buttons */}
                      {message.actions && message.actions.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.actions.map((action, idx) => (
                            <Button
                              key={idx}
                              onClick={() => handleActionClick(action.path)}
                              variant="outline"
                              size="sm"
                              className="w-full text-xs bg-white hover:bg-gray-50 text-blue-600 border-blue-200"
                            >
                              {action.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span
                          className={`text-[10px] ${
                            message.type === 'user' ? 'text-white/70' : 'text-gray-500'
                          }`}
                        >
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.type === 'bot' && (
                          <Button
                            onClick={() => handleCopyMessage(message.id, message.content)}
                            variant="ghost"
                            size="icon"
                            className={`h-5 w-5 ${
                              message.type === 'user'
                                ? 'text-white/70 hover:text-white hover:bg-white/10'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
                            }`}
                            title={t('chatbot.message.copy')}
                          >
                            {copiedId === message.id ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Invisible element for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Quick Suggestions */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 pb-3 flex-shrink-0">
                <p className="text-xs text-gray-500 mb-2">{t('chatbot.suggestions.title')}</p>
                <div className="flex flex-wrap gap-2">
                  {getQuickSuggestions().map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickSuggestion(suggestion)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={t('chatbot.input.placeholder')}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  disabled={isTyping}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                  title={t('chatbot.input.send')}
                >
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Send className="h-4 w-4 text-white" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}