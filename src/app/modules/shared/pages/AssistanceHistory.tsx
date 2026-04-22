import { useState } from 'react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAssistanceHistory } from '@app/contexts/AssistanceHistoryContext';
import { useNavigate } from 'react-router';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { AssistanceSubMenu } from '@app/components/AssistanceSubMenu';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Textarea } from '@app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@app/components/ui/popover';
import {
  History,
  Search,
  FileText,
  Handshake,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Mail,
  MessageCircle,
  Calendar,
  Filter,
  Bell,
  Eye,
  Reply,
  UserCircle,
  Headphones,
  AlertCircle,
  TrendingUp,
  Building2,
  X,
  Archive,
  Users,
  GraduationCap,
} from 'lucide-react';

interface HistoryEntry {
  id: string;
  type: 'contact' | 'assistance' | 'invitation' | 'partnership' | 'team-invitation' | 'training_enrollment';
  expertName?: string;
  expertRole?: string;
  organizationName?: string;
  title: string;
  status: 'pending' | 'accepted' | 'rejected' | 'sent' | 'responded' | 'in_progress' | 'closed' | 'enrolled';
  date: Date;
  responseDate?: Date;
  message?: string;
  response?: string;
  isNew?: boolean;
  requestType?: 'technical' | 'methodological' | 'graphic' | 'other';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  isArchived?: boolean;
  userEmail?: string;
  userPhone?: string;
  userCompany?: string;
  sector?: string;
}

export default function AssistanceHistory() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { history, updateHistoryEntry } = useAssistanceHistory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  
  // États pour la modal de réponse
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  
  // État pour la modal de détails
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [detailsEntry, setDetailsEntry] = useState<HistoryEntry | null>(null);
  
  // État pour le toast/notification
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    show: false,
    message: '',
    type: 'success'
  });

  // Filtrer l'historique
  const filteredHistory = history.filter((entry) => {
    // Filtre automatique : afficher uniquement les entrées de moins d'un an
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const isWithinOneYear = entry.date >= oneYearAgo;
    
    if (!isWithinOneYear) return false;
    
    // Filtre de recherche
    const searchMatch = searchQuery === '' || 
      entry.expertName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.expertRole?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.organizationName?.toLowerCase().includes(searchQuery.toLowerCase());

    // Filtre de type
    const typeMatch = selectedType.length === 0 || selectedType.includes(entry.type);

    // Filtre de statut
    const statusMatch = selectedStatus.length === 0 || selectedStatus.includes(entry.status);

    // Filtre de date additionnel (filtres utilisateur)
    let dateMatch = true;
    if (dateFilter !== 'all') {
      const entryDate = entry.date;
      if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateMatch = entryDate >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateMatch = entryDate >= monthAgo;
      } else if (dateFilter === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        dateMatch = entryDate >= yearAgo;
      }
    }

    return searchMatch && typeMatch && statusMatch && dateMatch;
  });

  // Compter les nouvelles réponses
  const newResponsesCount = history.filter(entry => entry.isNew && entry.response).length;

  const handleTypeFilter = (type: string) => {
    setSelectedType((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedType([]);
    setSelectedStatus([]);
    setDateFilter('all');
  };

  const activeFiltersCount = 
    selectedType.length + 
    selectedStatus.length + 
    (dateFilter !== 'all' ? 1 : 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'sent':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'responded':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'closed':
        return <Archive className="w-4 h-4 text-gray-500" />;
      case 'enrolled':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('assistance.history.time.justNow');
    } else if (diffDays < 7) {
      return t('assistance.history.time.daysAgo').replace('{count}', diffDays.toString());
    } else {
      return date.toLocaleDateString(t('common.locale'), {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const handleReply = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setReplyDialogOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedEntry || !replyMessage.trim()) return;
    
    setIsSendingReply(true);
    
    // Simuler l'envoi de la réponse (API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mettre à jour l'historique avec la nouvelle réponse de l'utilisateur
    updateHistoryEntry(selectedEntry.id, {
      response: replyMessage, // Ajouter la réponse de l'utilisateur
      responseDate: new Date(), // Date actuelle
      isNew: false, // Marquer comme lu
    });
    
    // Fermer la modal
    setReplyDialogOpen(false);
    
    // Réinitialiser le message
    setReplyMessage('');
    
    // Afficher la notification de succès
    setNotification({
      show: true,
      message: t('assistance.history.notifications.replySuccess'),
      type: 'success'
    });
    
    // Masquer automatiquement après 3 secondes
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
    
    setIsSendingReply(false);
  };

  const handleArchive = (entry: HistoryEntry) => {
    // Vérifier si l'entrée est déjà archivée
    if (entry.isArchived) {
      // Désarchiver
      updateHistoryEntry(entry.id, { isArchived: false });
      setNotification({
        show: true,
        message: t('assistance.history.notifications.unarchiveSuccess'),
        type: 'info'
      });
    } else {
      // Archiver
      updateHistoryEntry(entry.id, { isArchived: true });
      setNotification({
        show: true,
        message: t('assistance.history.notifications.archiveSuccess'),
        type: 'success'
      });
    }
    
    // Masquer automatiquement après 3 secondes
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleViewDetails = (entry: HistoryEntry) => {
    setDetailsEntry(entry);
    setDetailsDialogOpen(true);
    // Marquer comme lu si c'est nouveau
    if (entry.isNew) {
      updateHistoryEntry(entry.id, { isNew: false });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <PageBanner
        title={t('assistance.history.title')}
        description={t('assistance.history.subtitle')}
        icon={History}
        stats={[
          { value: history.length.toString(), label: t('assistance.history.entries') },
          ...(newResponsesCount > 0 ? [{ value: newResponsesCount.toString(), label: t('assistance.history.newResponses') }] : [])
        ]}
      />

      {/* Sub Menu */}
      <AssistanceSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* Horizontal Filters */}
          <div className="bg-white rounded-lg border p-4 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search + Filter Buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 flex-1 w-full sm:max-w-md">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('assistance.filters.search')}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Search className="w-4 h-4" />
                  </Button>
                </form>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Type Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="w-4 h-4 mr-2" />
                        {t('assistance.filters.type')}
                        {selectedType.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{selectedType.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('assistance.filters.type')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {['contact', 'assistance', 'invitation', 'partnership', 'team-invitation', 'training_enrollment'].map((type) => (
                            <Button
                              key={type}
                              variant={selectedType.includes(type) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleTypeFilter(type)}
                            >
                              {selectedType.includes(type) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`assistance.history.type.${type}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Status Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {t('assistance.filters.status')}
                        {selectedStatus.length > 0 && (
                          <Badge className="ml-2" variant="secondary">{selectedStatus.length}</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">{t('assistance.filters.status')}</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {['pending', 'accepted', 'rejected', 'sent', 'responded', 'in_progress', 'closed', 'enrolled'].map((status) => (
                            <Button
                              key={status}
                              variant={selectedStatus.includes(status) ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => handleStatusFilter(status)}
                            >
                              {selectedStatus.includes(status) && <CheckCircle className="w-3 h-3 mr-2" />}
                              {t(`assistance.history.status.${status}`)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Date Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date
                        {dateFilter !== 'all' && (
                          <Badge className="ml-2" variant="secondary">1</Badge>
                        )}
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48" align="start">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm mb-3">Période</h4>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { value: 'all', label: 'Toutes' },
                            { value: 'week', label: '7 derniers jours' },
                            { value: 'month', label: '30 derniers jours' },
                            { value: 'year', label: 'Cette année' },
                          ].map((option) => (
                            <Button
                              key={option.value}
                              variant={dateFilter === option.value ? "default" : "outline"}
                              size="sm"
                              className="w-full justify-start text-xs"
                              onClick={() => setDateFilter(option.value as any)}
                            >
                              {dateFilter === option.value && <CheckCircle className="w-3 h-3 mr-2" />}
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-muted-foreground"
                    >
                      {t('assistance.filters.clear')} ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredHistory.length} {t('assistance.history.entries')}
            </p>
            {newResponsesCount > 0 && (
              <Badge className="bg-[#B82547] text-white">
                <Bell className="w-3 h-3 mr-1" />
                {newResponsesCount} {t('assistance.history.newResponses')}
              </Badge>
            )}
          </div>

          {/* History List */}
          {filteredHistory.length === 0 ? (
            <div className="bg-white rounded-lg border p-12 text-center">
              <History className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-primary mb-2">
                {t('assistance.history.empty.title')}
              </h3>
              <p className="text-muted-foreground">
                {t('assistance.history.empty.message')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div 
                  key={entry.id} 
                  className={`bg-white rounded-lg border p-6 hover:shadow-md transition-shadow relative ${
                    entry.isNew ? 'border-l-4 border-l-[#B82547]' : ''
                  }`}
                >
                  {/* Badge "NEW" pour les nouvelles réponses */}
                  {entry.isNew && entry.response && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-[#B82547] text-white">
                        <Bell className="w-3 h-3 mr-1" />
                        {t('assistance.history.new')}
                      </Badge>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#3d4654] to-[#B82547] flex items-center justify-center">
                      {entry.type === 'contact' && <UserCircle className="w-5 h-5 text-white" />}
                      {entry.type === 'assistance' && <Headphones className="w-5 h-5 text-white" />}
                      {entry.type === 'invitation' && <Mail className="w-5 h-5 text-white" />}
                      {entry.type === 'partnership' && <Handshake className="w-5 h-5 text-white" />}
                      {entry.type === 'team-invitation' && <Users className="w-5 h-5 text-white" />}
                      {entry.type === 'training_enrollment' && <GraduationCap className="w-5 h-5 text-white" />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                entry.type === 'contact' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                                entry.type === 'assistance' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                'bg-green-50 text-green-700 border-green-200'
                              }`}
                            >
                              {t(`assistance.history.type.${entry.type}`)}
                            </Badge>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(entry.status)}
                              <span className="text-xs text-muted-foreground">
                                {t(`assistance.history.status.${entry.status}`)}
                              </span>
                            </div>
                            {/* Badge priorité pour les demandes d'assistance */}
                            {entry.type === 'assistance' && entry.priority && (
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  entry.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' : 
                                  entry.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                                  entry.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                  'bg-gray-50 text-gray-700 border-gray-200'
                                }`}
                              >
                                <AlertCircle className="w-3 h-3 mr-1" />
                                {t(`assistance.priority.${entry.priority}`)}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-[#3d4654] mb-1">
                            {entry.title}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {entry.type === 'contact' || entry.type === 'invitation' ? (
                              <>
                                <UserCircle className="w-4 h-4" />
                                <span>{entry.expertName} • {entry.expertRole}</span>
                              </>
                            ) : (
                              <>
                                <Building2 className="w-4 h-4" />
                                <span>{entry.organizationName || 'Assortis Support Team'}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(entry.date)}
                          </p>
                          {entry.responseDate && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {t('assistance.history.respondedOn')} {formatDate(entry.responseDate)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      {entry.message && (
                        <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="flex items-center gap-2 mb-2">
                            <Send className="w-4 h-4 text-[#3d4654]" />
                            <p className="text-xs font-semibold text-[#3d4654]">
                              {t('assistance.history.yourMessage')}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {entry.message}
                          </p>
                        </div>
                      )}

                      {/* Response */}
                      {entry.response && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-l-4 border-[#3d4654]">
                          <div className="flex items-center gap-2 mb-2">
                            <Reply className="w-4 h-4 text-[#3d4654]" />
                            <p className="text-xs font-semibold text-[#3d4654]">
                              {t('assistance.history.response')}
                            </p>
                            {entry.responseDate && (
                              <span className="text-xs text-muted-foreground">• {formatDate(entry.responseDate)}</span>
                            )}
                          </div>
                          <p className="text-sm text-[#3d4654] leading-relaxed font-medium">
                            {entry.response}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 flex items-center gap-2 pt-3 border-t flex-wrap">
                        {entry.type === 'contact' && entry.status === 'responded' && (
                          <Button 
                            variant="default" 
                            size="sm"
                            className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
                            onClick={() => handleReply(entry)}
                          >
                            <Reply className="w-4 h-4 mr-2" />
                            {t('assistance.history.actions.reply')}
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(entry)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t('assistance.history.actions.viewDetails')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>

      {/* Modal de réponse */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('assistance.history.reply.title')}</DialogTitle>
          </DialogHeader>
          
          {/* Informations sur l'entrée */}
          {selectedEntry && (
            <div className="mb-4">
              <p className="text-sm font-medium text-[#3d4654]">
                {selectedEntry.expertName || selectedEntry.organizationName}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedEntry.title}
              </p>
            </div>
          )}
          
          {/* Message original */}
          {selectedEntry?.response && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <p className="text-xs font-semibold text-[#3d4654] mb-1">
                {t('assistance.history.response')}
              </p>
              <p className="text-sm text-muted-foreground">
                {selectedEntry.response}
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#3d4654]">
              {t('assistance.history.reply.yourReply')}
            </label>
            <Textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder={t('assistance.history.reply.placeholder')}
              className="min-h-[120px]"
            />
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setReplyDialogOpen(false);
                setReplyMessage('');
              }}
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.cancel')}
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="bg-[#B82547] hover:bg-[#a01f3c] text-white"
              onClick={handleSendReply}
              disabled={isSendingReply || !replyMessage.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSendingReply ? t('assistance.history.reply.sending') : t('assistance.history.reply.send')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de détails */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#B82547]" />
              {t('assistance.history.details.title')}
            </DialogTitle>
            <DialogDescription>
              {t('assistance.history.details.subtitle')}
            </DialogDescription>
          </DialogHeader>

          {detailsEntry && (
            <div className="space-y-4">
              {/* En-tête de l'entrée */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-[#3d4654] to-[#B82547] flex items-center justify-center">
                    {detailsEntry.type === 'contact' && <UserCircle className="w-5 h-5 text-white" />}
                    {detailsEntry.type === 'assistance' && <Headphones className="w-5 h-5 text-white" />}
                    {detailsEntry.type === 'invitation' && <Mail className="w-5 h-5 text-white" />}
                    {detailsEntry.type === 'partnership' && <Handshake className="w-5 h-5 text-white" />}
                    {detailsEntry.type === 'team-invitation' && <Users className="w-5 h-5 text-white" />}
                    {detailsEntry.type === 'training_enrollment' && <GraduationCap className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          detailsEntry.type === 'contact' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          detailsEntry.type === 'assistance' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                          'bg-green-50 text-green-700 border-green-200'
                        }`}
                      >
                        {t(`assistance.history.type.${detailsEntry.type}`)}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(detailsEntry.status)}
                        <span className="text-xs text-muted-foreground">
                          {t(`assistance.history.status.${detailsEntry.status}`)}
                        </span>
                      </div>
                      {detailsEntry.type === 'assistance' && detailsEntry.priority && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            detailsEntry.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' : 
                            detailsEntry.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' : 
                            detailsEntry.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {t(`assistance.priority.${detailsEntry.priority}`)}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#3d4654] text-lg mb-1">
                      {detailsEntry.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {detailsEntry.type === 'contact' || detailsEntry.type === 'invitation' ? (
                        <>
                          <UserCircle className="w-4 h-4" />
                          <span>{detailsEntry.expertName} • {detailsEntry.expertRole}</span>
                        </>
                      ) : (
                        <>
                          <Building2 className="w-4 h-4" />
                          <span>{detailsEntry.organizationName || 'Assortis Support Team'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[#B82547]" />
                    <p className="text-xs font-semibold text-gray-700">
                      {t('assistance.history.details.sentDate')}
                    </p>
                  </div>
                  <p className="text-sm text-[#3d4654] font-medium">
                    {detailsEntry.date.toLocaleDateString(t('common.locale'), {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {detailsEntry.responseDate && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-gray-700">
                        {t('assistance.history.details.responseDate')}
                      </p>
                    </div>
                    <p className="text-sm text-[#3d4654] font-medium">
                      {detailsEntry.responseDate.toLocaleDateString(t('common.locale'), {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Type de demande pour assistance */}
              {detailsEntry.type === 'assistance' && detailsEntry.requestType && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-[#B82547]" />
                    <p className="text-xs font-semibold text-gray-700">
                      {t('assistance.history.details.requestType')}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t(`assistance.requestType.${detailsEntry.requestType}`)}
                  </Badge>
                </div>
              )}

              {/* Message de l'utilisateur */}
              {detailsEntry.message && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Send className="w-4 h-4 text-[#3d4654]" />
                    <p className="text-sm font-semibold text-[#3d4654]">
                      {t('assistance.history.yourMessage')}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {detailsEntry.message}
                    </p>
                  </div>
                </div>
              )}

              {/* Réponse */}
              {detailsEntry.response && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Reply className="w-4 h-4 text-[#3d4654]" />
                    <p className="text-sm font-semibold text-[#3d4654]">
                      {t('assistance.history.response')}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-l-4 border-[#3d4654]">
                    <p className="text-sm text-[#3d4654] leading-relaxed font-medium whitespace-pre-wrap">
                      {detailsEntry.response}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions dans la modale */}
              <div className="flex items-center gap-2 pt-4 border-t">
                {detailsEntry.type === 'contact' && detailsEntry.status === 'responded' && (
                  <Button 
                    variant="default" 
                    size="sm"
                    className="bg-[#B82547] hover:bg-[#a01f3c] text-white flex-1"
                    onClick={() => {
                      setDetailsDialogOpen(false);
                      handleReply(detailsEntry);
                    }}
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    {t('assistance.history.actions.reply')}
                  </Button>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDetailsDialogOpen(false)}
            >
              <X className="w-4 h-4 mr-2" />
              {t('common.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-right">
          <div
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] ${
              notification.type === 'success' ? 'bg-green-500 text-white' :
              notification.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Bell className="w-5 h-5" />}
            <span className="flex-1 font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification({ ...notification, show: false })}
              className="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}