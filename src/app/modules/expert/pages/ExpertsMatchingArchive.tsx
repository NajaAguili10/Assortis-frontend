import { format } from 'date-fns';
import { fr, enUS, es } from 'date-fns/locale';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { StatCard } from '@app/components/StatCard';
import { Button } from '@app/components/ui/button';
import { Badge } from '@app/components/ui/badge';
import { Card } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import { Input } from '@app/components/ui/input';
import { Textarea } from '@app/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@app/components/ui/dialog';
import { useMatchingArchive } from '@app/modules/expert/hooks/useMatchingArchive';
import { toast } from 'sonner';
import {
  Archive,
  Calendar,
  FileText,
  Users,
  TrendingUp,
  Eye,
  Trash2,
  Search,
  AlertCircle,
  Mail,
  Loader2,
} from 'lucide-react';

export default function ExpertsMatchingArchive() {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  const { archives, deleteMatching } = useMatchingArchive();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [archiveToDelete, setArchiveToDelete] = useState<string | null>(null);

  // Contact Dialog State
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedExpertForContact, setSelectedExpertForContact] = useState<{
    expertId: string;
    expertName: string;
  } | null>(null);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSendingContact, setIsSendingContact] = useState(false);

  // Get date locale based on current language
  const dateLocale = language === 'fr' ? fr : language === 'es' ? es : enUS;

  // Filter archives by search query
  const filteredArchives = archives.filter((archive) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      archive.tenderTitle.toLowerCase().includes(query) ||
      archive.torTitle?.toLowerCase().includes(query) ||
      archive.tenderReference?.toLowerCase().includes(query) ||
      archive.matchedExperts.some((expert) =>
        expert.expertName.toLowerCase().includes(query)
      )
    );
  });

  // Calculate KPIs
  const totalArchives = archives.length;
  const totalExperts = archives.reduce(
    (acc, archive) => acc + archive.matchedExperts.length,
    0
  );
  const avgExpertsPerMatching =
    totalArchives > 0 ? Math.round(totalExperts / totalArchives) : 0;
  const avgMatchScore =
    totalExperts > 0
      ? Math.round(
          archives.reduce(
            (acc, archive) =>
              acc +
              archive.matchedExperts.reduce(
                (sum, expert) => sum + expert.matchScore,
                0
              ),
            0
          ) / totalExperts
        )
      : 0;

  const handleViewDetails = (archiveId: string) => {
    setSelectedArchive(archiveId);
  };

  const handleCloseDetails = () => {
    setSelectedArchive(null);
  };

  const handleDeleteConfirm = (archiveId: string) => {
    setArchiveToDelete(archiveId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteArchive = () => {
    if (archiveToDelete) {
      deleteMatching(archiveToDelete);
      toast.success(t('matchingArchive.messages.deleted'));
      if (selectedArchive === archiveToDelete) {
        handleCloseDetails();
      }
      setDeleteDialogOpen(false);
      setArchiveToDelete(null);
    }
  };

  // Handle Contact Expert
  const handleContactExpert = (expertId: string, expertName: string) => {
    setSelectedExpertForContact({ expertId, expertName });
    setContactDialogOpen(true);
  };

  const handleCloseContactDialog = () => {
    setContactDialogOpen(false);
    setSelectedExpertForContact(null);
    setContactSubject('');
    setContactMessage('');
  };

  const handleSendContact = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      toast.error(t('experts.contact.error'));
      return;
    }

    setIsSendingContact(true);
    // Simulate sending
    setTimeout(() => {
      setIsSendingContact(false);
      toast.success(
        t('experts.contact.success', { expertName: selectedExpertForContact?.expertName || '' })
      );
      handleCloseContactDialog();
    }, 1500);
  };

  const selectedArchiveData = selectedArchive
    ? archives.find((a) => a.id === selectedArchive)
    : null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner */}
      <PageBanner
        title={t('matchingArchive.title')}
        description={t('matchingArchive.subtitle')}
        icon={Archive}
        stats={[
          { value: totalArchives.toString(), label: t('matchingArchive.kpis.totalArchives') },
        ]}
      />

      {/* Sub Menu */}
      <ExpertsSubMenu />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <StatCard
              title={t('matchingArchive.kpis.totalArchives')}
              value={totalArchives.toString()}
              subtitle={t('matchingArchive.kpis.totalArchivesSubtitle')}
              icon={Archive}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
            />
            <StatCard
              title={t('matchingArchive.kpis.totalExperts')}
              value={totalExperts.toString()}
              subtitle={t('matchingArchive.kpis.totalExpertsSubtitle')}
              icon={Users}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
            />
            <StatCard
              title={t('matchingArchive.kpis.avgExperts')}
              value={avgExpertsPerMatching.toString()}
              subtitle={t('matchingArchive.kpis.avgExpertsSubtitle')}
              icon={TrendingUp}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
            />
            <StatCard
              title={t('matchingArchive.kpis.avgScore')}
              value={`${avgMatchScore}%`}
              subtitle={t('matchingArchive.kpis.avgScoreSubtitle')}
              icon={TrendingUp}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
            />
          </div>

          <Separator className="my-6" />

          {/* Search Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">
                {t('common.search')}
              </h3>
            </div>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('matchingArchive.search.placeholder')}
              className="w-full"
            />
          </div>

          {/* Archives List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-primary">
                {t('matchingArchive.list.title')}
              </h2>
              <Badge variant="secondary">
                {filteredArchives.length} {t('matchingArchive.list.results')}
              </Badge>
            </div>

            {filteredArchives.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredArchives.map((archive) => (
                  <Card key={archive.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Left: Archive Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {archive.tenderTitle}
                            </h3>
                            {archive.torTitle && (
                              <p className="text-sm text-gray-600 mb-2">
                                <span className="font-medium">{t('matchingArchive.card.tor')}:</span>{' '}
                                {archive.torTitle}
                              </p>
                            )}
                            {archive.tenderReference && (
                              <Badge variant="outline" className="mb-2">
                                {archive.tenderReference}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(archive.matchingDate), 'PPP', { locale: dateLocale })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {archive.matchedExperts.length} {t('matchingArchive.card.experts')}
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            {t('matchingArchive.card.avgScore')}:{' '}
                            {Math.round(
                              archive.matchedExperts.reduce(
                                (sum, expert) => sum + expert.matchScore,
                                0
                              ) / archive.matchedExperts.length
                            )}
                            %
                          </div>
                        </div>

                        {/* Notes Preview */}
                        {archive.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {archive.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex md:flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(archive.id)}
                          className="flex-1 md:flex-none"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {t('actions.viewDetails')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteConfirm(archive.id)}
                          className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          {t('actions.delete')}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery
                    ? t('matchingArchive.noResults')
                    : t('matchingArchive.noArchives')}
                </h3>
                <p className="text-sm text-gray-600">
                  {searchQuery
                    ? t('matchingArchive.noResults.message')
                    : t('matchingArchive.noArchives.message')}
                </p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>

      {/* Details Dialog */}
      <Dialog open={!!selectedArchive} onOpenChange={handleCloseDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary">
              {selectedArchiveData?.tenderTitle}
            </DialogTitle>
          </DialogHeader>

          {selectedArchiveData && (
            <div className="space-y-6">
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(selectedArchiveData.matchingDate), 'PPP', {
                    locale: dateLocale,
                  })}
                </div>
                {selectedArchiveData.tenderReference && (
                  <Badge variant="outline">{selectedArchiveData.tenderReference}</Badge>
                )}
              </div>

              {/* ToR Info */}
              {selectedArchiveData.torTitle && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    {t('matchingArchive.details.tor')}
                  </h4>
                  <p className="text-sm text-gray-700">{selectedArchiveData.torTitle}</p>
                </div>
              )}

              {/* Notes Section */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">
                  {t('matchingArchive.details.notes')}
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedArchiveData.notes || t('matchingArchive.details.noNotes')}
                  </p>
                </div>
              </div>

              {/* Matched Experts */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  {t('matchingArchive.details.matchedExperts')} ({selectedArchiveData.matchedExperts.length})
                </h4>
                <div className="space-y-3">
                  {selectedArchiveData.matchedExperts
                    .sort((a, b) => b.matchScore - a.matchScore)
                    .map((expert) => (
                      <div
                        key={expert.expertId}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              {expert.expertName}
                            </h5>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary">
                                  {expert.experience} {t('matchingArchive.details.yearsExp')}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant={
                                    expert.availability === 'available'
                                      ? 'default'
                                      : 'outline'
                                  }
                                >
                                  {t(`availability.${expert.availability}`)}
                                </Badge>
                              </div>
                            </div>
                            {expert.skills.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {expert.skills.slice(0, 5).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {expert.skills.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{expert.skills.length - 5}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-[var(--accent)]">
                                {expert.matchScore}%
                              </div>
                              <div className="text-xs text-gray-500">
                                {t('matchingArchive.details.matchScore')}
                              </div>
                            </div>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleContactExpert(expert.expertId, expert.expertName)}
                              className="whitespace-nowrap"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              {t('experts.publicProfile.contactExpert')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDetails}>
              {t('actions.close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('matchingArchive.delete.title')}</DialogTitle>
            <DialogDescription>
              {t('matchingArchive.delete.message')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteArchive}
            >
              {t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Expert Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={handleCloseContactDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[#B82547]" />
              {t('experts.contact.title')}
            </DialogTitle>
            <DialogDescription>
              {t('experts.contact.description')}
            </DialogDescription>
          </DialogHeader>

          {selectedExpertForContact && (
            <div className="flex items-center gap-4 py-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">
                  {selectedExpertForContact.expertName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-primary">
                  {selectedExpertForContact.expertName}
                </h4>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('experts.contact.subject')}
              </label>
              <Input
                type="text"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                placeholder={t('experts.contact.subjectPlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('experts.contact.message')}
              </label>
              <Textarea
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder={t('experts.contact.messagePlaceholder')}
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseContactDialog}
              disabled={isSendingContact}
            >
              {t('experts.contact.cancel')}
            </Button>
            <Button
              type="button"
              onClick={handleSendContact}
              disabled={isSendingContact}
            >
              {isSendingContact ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('experts.contact.sending')}
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {t('experts.contact.send')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}