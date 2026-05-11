import { useEffect, useMemo, useState } from 'react';
import { Archive, Download, FileText, Link2, Search } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { ExpertWorkspaceTabs } from '@app/modules/expert/components/ExpertWorkspaceTabs';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { JobOfferListDTO, JobOfferStatusEnum } from '@app/modules/posting-board/types/JobOffer.dto';
import { getAllJobOffers } from '@app/modules/posting-board/services/jobOfferService';
import { downloadExpertCvFile, EXPERT_DONOR_REFERENCE_FORMATS } from '@app/modules/expert/services/expertReferenceGeneration.service';
import { toast } from 'sonner';

export default function MyExpertsPage() {
  const { allExperts } = useExperts();
  const {
    expertLibrary,
    recordExpertDownload,
    recordExpertReference,
    linkExpertToVacancy,
  } = useCVCredits();
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedVacancyByExpert, setSelectedVacancyByExpert] = useState<Record<string, string>>({});
  const [selectedFormatByExpert, setSelectedFormatByExpert] = useState<Record<string, string>>({});
  const [vacancies, setVacancies] = useState<JobOfferListDTO[]>([]);

  useEffect(() => {
    getAllJobOffers()
      .then((offers) => setVacancies(offers.filter((offer) => offer.status === JobOfferStatusEnum.PUBLISHED)))
      .catch(() => setVacancies([]));
  }, []);

  const experts = useMemo(() => {
    const rows = expertLibrary.map((record) => {
      const expert = allExperts.find((item) => item.id === record.expertId);
      return { record, expert };
    });
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter(({ record, expert }) => [
          record.expertName,
          expert?.title,
          expert?.country,
          ...(expert?.skills || []),
          ...(expert?.sectors || []),
        ].join(' ').toLowerCase().includes(needle))
      : rows;

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return a.record.expertName.localeCompare(b.record.expertName);
      if (sortBy === 'downloads') return b.record.downloads.length - a.record.downloads.length;
      return new Date(b.record.unlockedAt).getTime() - new Date(a.record.unlockedAt).getTime();
    });
  }, [allExperts, expertLibrary, query, sortBy]);

  const handleDownload = (expertId: string) => {
    const expert = allExperts.find((item) => item.id === expertId);
    if (!expert) return;
    const fileName = downloadExpertCvFile(expert, 'Full CV');
    recordExpertDownload(expertId, 'Full CV', fileName);
    toast.success('CV downloaded');
  };

  const handleGenerateReference = (expertId: string) => {
    const expert = allExperts.find((item) => item.id === expertId);
    const donorFormat = selectedFormatByExpert[expertId] || EXPERT_DONOR_REFERENCE_FORMATS[0];
    if (!expert) return;
    const fileName = downloadExpertCvFile(expert, donorFormat);
    recordExpertReference(expertId, donorFormat, fileName);
    toast.success(`${donorFormat} generated`);
  };

  const handleLinkVacancy = (expertId: string) => {
    const vacancyId = selectedVacancyByExpert[expertId];
    const vacancy = vacancies.find((item) => item.id === vacancyId);
    if (!vacancy) return;
    linkExpertToVacancy(expertId, {
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.jobTitle,
      projectTitle: vacancy.projectTitle,
    });
    toast.success('Expert linked to vacancy');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title="My Experts"
        description="Unlocked experts, downloaded CVs, generated references, and vacancy links."
        icon={Archive}
      />
      <ExpertsSubMenu />
      <PageContainer className="my-6">
        <div className="space-y-6 px-4 py-6">
          <ExpertWorkspaceTabs />
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search unlocked experts, sectors, countries..." className="pl-10" />
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">{expertLibrary.length} unlocked experts</Badge>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest unlocked</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="downloads">Most downloads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {experts.length === 0 ? (
            <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
              <Archive className="mx-auto mb-3 h-10 w-10 text-gray-400" />
              <h3 className="text-base font-semibold text-primary">No unlocked experts yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">Unlock CVs from Search Experts to build your organisation expert library.</p>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {experts.map(({ record, expert }) => (
                <article key={record.expertId} className="rounded-lg border bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{expert ? `${expert.firstName} ${expert.lastName}` : record.expertName}</h3>
                      <p className="text-sm text-muted-foreground">{expert?.title || 'Expert profile'}</p>
                      <p className="mt-1 text-sm text-gray-600">{expert?.email || 'contact@example.org'} · {expert?.country || 'Country N/A'}</p>
                    </div>
                    <Badge className="w-fit bg-emerald-50 text-emerald-700 border border-emerald-200">Downloaded</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {(expert?.sectors || []).slice(0, 4).map((sector) => <Badge key={sector} variant="outline">{sector}</Badge>)}
                    {(expert?.skills || []).slice(0, 4).map((skill) => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-md bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-primary">{record.downloads.length}</p>
                      <p className="text-muted-foreground">CV downloads</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-primary">{record.references.length}</p>
                      <p className="text-muted-foreground">References</p>
                    </div>
                    <div className="rounded-md bg-slate-50 p-3 text-sm">
                      <p className="font-semibold text-primary">{record.linkedVacancies.length}</p>
                      <p className="text-muted-foreground">Linked vacancies</p>
                    </div>
                  </div>

                  {record.linkedVacancies.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {record.linkedVacancies.map((link) => (
                        <Badge key={link.vacancyId} variant="outline">{link.vacancyTitle}{link.projectTitle ? ` - ${link.projectTitle}` : ''}</Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 grid gap-3 lg:grid-cols-[auto_1fr_auto]">
                    <Button type="button" variant="outline" onClick={() => handleDownload(record.expertId)}>
                      <Download className="mr-2 h-4 w-4" />
                      Re-download CV
                    </Button>
                    <Select
                      value={selectedFormatByExpert[record.expertId] || EXPERT_DONOR_REFERENCE_FORMATS[0]}
                      onValueChange={(value) => setSelectedFormatByExpert((current) => ({ ...current, [record.expertId]: value }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {EXPERT_DONOR_REFERENCE_FORMATS.map((format) => <SelectItem key={format} value={format}>{format}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={() => handleGenerateReference(record.expertId)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Reference
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto]">
                    <Select
                      value={selectedVacancyByExpert[record.expertId] || ''}
                      onValueChange={(value) => setSelectedVacancyByExpert((current) => ({ ...current, [record.expertId]: value }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Link to project vacancy" /></SelectTrigger>
                      <SelectContent>
                        {vacancies.map((vacancy) => (
                          <SelectItem key={vacancy.id} value={vacancy.id}>
                            {vacancy.jobTitle}{vacancy.projectTitle ? ` - ${vacancy.projectTitle}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={() => handleLinkVacancy(record.expertId)} disabled={!selectedVacancyByExpert[record.expertId]}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Link vacancy
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
