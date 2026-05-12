import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Download, Link2, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { useCVCredits } from '@app/contexts/CVCreditsContext';
import { JobOfferListDTO, JobOfferStatusEnum } from '@app/modules/posting-board/types/JobOffer.dto';
import { getAllJobOffers } from '@app/modules/posting-board/services/jobOfferService';
import { downloadExpertCvFile } from '@app/modules/expert/services/expertReferenceGeneration.service';
import {
  ExpertPreviewDTO,
  ExpertSearchResult,
  getExpertPreview,
} from '@app/modules/expert/services/expertSearch.service';
import { useExperts } from '@app/modules/expert/hooks/useExperts';

function PreviewList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</h4>
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => <Badge key={item} variant="outline" className="text-xs">{item}</Badge>)}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Not specified in preview.</p>
      )}
    </div>
  );
}

export default function ExpertPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = location.state as { expert?: ExpertSearchResult; returnTo?: string } | null;
  const returnTo = routeState?.returnTo || '/experts/search';
  const expertId = Number(id);
  const { allExperts } = useExperts();
  const localExpert = allExperts.find((expert) => String(expert.id) === String(id));
  const fallbackExpert: ExpertSearchResult | undefined = useMemo(() => {
    if (routeState?.expert) return routeState.expert;
    if (!localExpert) return undefined;

    return {
      id: Number(localExpert.id),
      firstName: localExpert.firstName,
      lastName: localExpert.lastName,
      fullName: `${localExpert.firstName} ${localExpert.lastName}`.trim(),
      title: localExpert.title,
      currentPosition: localExpert.title,
      yearsExperience: localExpert.yearsOfExperience,
      country: { name: localExpert.country },
      city: { name: localExpert.city },
      ratingAvg: localExpert.clientRating,
      completedProjects: localExpert.completedMissions,
      completedMissions: localExpert.completedMissions,
      verified: localExpert.verified,
      level: localExpert.level,
      profileSummary: localExpert.bio,
      sectors: localExpert.sectors.map((sector) => ({ sectorName: String(sector) })),
      skills: localExpert.skills.map((skill) => ({ skillName: skill })),
      languages: localExpert.languages.map((language) => ({
        languageName: language.language,
        proficiency: language.level,
      })),
    };
  }, [localExpert, routeState]);

  const { availableCredits, libraryExpertIds, unlockExpertCV, recordExpertDownload, linkExpertToVacancy } = useCVCredits();
  const [preview, setPreview] = useState<ExpertPreviewDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [projectVacancies, setProjectVacancies] = useState<JobOfferListDTO[]>([]);
  const [selectedVacancyId, setSelectedVacancyId] = useState('');
  const [pendingUnlock, setPendingUnlock] = useState(false);

  const isUnlocked = libraryExpertIds.includes(String(expertId));

  const downloadExpert = useMemo<ExpertSearchResult>(() => {
    if (fallbackExpert) return fallbackExpert;
    return {
      id: expertId,
      fullName: preview?.maskedName,
      currentPosition: preview?.currentPosition,
      title: preview?.title,
      yearsExperience: preview?.yearsExperience,
      profileSummary: preview?.profileSummary,
      country: preview?.country ? { name: preview.country } : undefined,
      city: preview?.city ? { name: preview.city } : undefined,
      completedProjects: preview?.completedProjects,
      level: preview?.seniority,
      sectors: preview?.sectors.map((sector) => ({ sectorName: sector })) || [],
      skills: preview?.skills.map((skill) => ({ skillName: skill })) || [],
    };
  }, [expertId, fallbackExpert, preview]);

  useEffect(() => {
    if (!Number.isFinite(expertId)) {
      setError('Invalid expert id.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    getExpertPreview(expertId, fallbackExpert)
      .then(setPreview)
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load expert preview');
      })
      .finally(() => setIsLoading(false));
  }, [expertId, fallbackExpert]);

  useEffect(() => {
    getAllJobOffers()
      .then((offers) => {
        setProjectVacancies(offers.filter((offer) => offer.status === JobOfferStatusEnum.PUBLISHED && Boolean(offer.projectTitle || offer.linkedProjectId)));
      })
      .catch(() => setProjectVacancies([]));
  }, []);

  const handleBack = () => {
    navigate(returnTo);
  };

  const confirmUnlock = () => {
    const displayName =
      fallbackExpert?.fullName ||
      [fallbackExpert?.firstName, fallbackExpert?.lastName].filter(Boolean).join(' ') ||
      preview?.maskedName ||
      `Expert #${expertId}`;
    setPendingUnlock(false);
    const result = unlockExpertCV(String(expertId), displayName, 1);
    if (!result.success && result.error === 'INSUFFICIENT_CREDITS') {
      toast.error('Not enough credits to unlock this profile');
      return;
    }
    toast.success('Expert profile unlocked');
  };

  const handleDownload = () => {
    const fileName = downloadExpertCvFile(downloadExpert, 'Full CV');
    recordExpertDownload(String(expertId), 'Full CV', fileName);
    toast.success('CV downloaded');
  };

  const handleLinkToVacancy = () => {
    const vacancy = projectVacancies.find((item) => item.id === selectedVacancyId);
    if (!vacancy) return;
    linkExpertToVacancy(String(expertId), {
      vacancyId: vacancy.id,
      vacancyTitle: vacancy.jobTitle,
      projectTitle: vacancy.projectTitle,
    });
    toast.success('Expert linked to vacancy');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title={preview?.maskedName || `Expert #${id} preview`}
        description="Free expert profile preview for organisation users."
        icon={ShieldCheck}
      />
      <PageContainer className="my-6">
        <div className="space-y-5 px-4 py-6">
          <Button type="button" variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {isLoading ? (
            <div className="flex min-h-80 items-center justify-center rounded-lg border bg-white">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading preview...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error}
            </div>
          ) : preview ? (
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <main className="space-y-5">
                <section className="rounded-lg border border-primary/15 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold text-primary">{preview.title || preview.currentPosition || 'Expert profile'}</h1>
                      <p className="mt-1 text-sm text-gray-600">
                        {[preview.city, preview.country].filter(Boolean).join(', ') || 'Location available in preview when provided'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="font-semibold text-gray-900">{preview.yearsExperience ?? 'N/A'}</p>
                        <p className="text-gray-500">Years</p>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <p className="font-semibold text-gray-900">{preview.completedProjects ?? 'N/A'}</p>
                        <p className="text-gray-500">Projects</p>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-gray-700">{preview.profileSummary || 'No CV summary available in preview.'}</p>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Personal Information</h4>
                    <div className="grid gap-2 text-sm text-gray-700">
                      <p><span className="font-medium text-gray-900">Year of birth:</span> Available in unlocked CV</p>
                      <p><span className="font-medium text-gray-900">Nationality:</span> {preview.country || 'Not specified'}</p>
                      <p><span className="font-medium text-gray-900">Gender:</span> Not specified in preview</p>
                      <p><span className="font-medium text-gray-900">Marital status:</span> Not specified in preview</p>
                    </div>
                  </div>
                  <PreviewList title="Sectors" items={preview.sectors} />
                  <PreviewList title="Countries" items={preview.countries} />
                  <PreviewList title="Skills" items={preview.skills} />
                  <PreviewList title="Languages" items={preview.languages} />
                  <PreviewList title="Education" items={preview.education} />
                  <PreviewList title="Training" items={preview.skills.slice(0, 4)} />
                  <PreviewList title="Professional Experience" items={preview.keyProjects} />
                  <PreviewList title="Employment Record & Completed Projects" items={preview.keyProjects} />
                </section>
              </main>

              <aside className="space-y-5">
                <section className="rounded-lg border border-dashed border-gray-300 bg-white p-4">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-4 w-4 text-gray-500" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Locked until full access</h4>
                      <p className="mt-1 text-sm text-gray-600">
                        Full name, email, phone, CV download, and direct contact actions are hidden in the free preview.
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-primary/15 bg-white p-4">
                  <h4 className="text-sm font-semibold text-primary">Link expert to my project vacancy</h4>
                  <p className="mt-1 text-sm text-gray-600">Attach this expert as a recommended profile for an open vacancy.</p>
                  <div className="mt-3 grid gap-2">
                    <Select value={selectedVacancyId} onValueChange={setSelectedVacancyId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a project vacancy" />
                      </SelectTrigger>
                      <SelectContent>
                        {projectVacancies.map((vacancy) => (
                          <SelectItem key={vacancy.id} value={vacancy.id}>
                            {vacancy.jobTitle}{vacancy.projectTitle ? ` - ${vacancy.projectTitle}` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={handleLinkToVacancy} disabled={!selectedVacancyId}>
                      <Link2 className="mr-2 h-4 w-4" />
                      Link to vacancy
                    </Button>
                  </div>
                </section>

                <section className="rounded-lg border bg-white p-4">
                  <h4 className="text-sm font-semibold text-primary">Actions</h4>
                  <div className="mt-3 grid gap-2">
                    {isUnlocked ? (
                      <>
                        <Button type="button" variant="outline" onClick={handleDownload}>
                          <Download className="mr-2 h-4 w-4" />
                          Download CV
                        </Button>
                        <Button type="button" onClick={() => navigate(`/search/experts/${expertId}`, { state: { searchSection: 'experts' } })}>
                          View full profile
                        </Button>
                      </>
                    ) : (
                      <Button type="button" onClick={() => setPendingUnlock(true)}>
                        Use credit to view full details ({availableCredits} available)
                      </Button>
                    )}
                  </div>
                </section>
              </aside>
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-10 text-center text-sm text-gray-500">Preview is unavailable.</div>
          )}
        </div>
      </PageContainer>

      <Dialog open={pendingUnlock} onOpenChange={(open) => !open && setPendingUnlock(false)}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Unlock CV</DialogTitle>
            <DialogDescription>
              Unlock this expert's full CV to view their complete profile and contact details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-lg border bg-muted/40 px-4 py-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Credits required</span>
              <span className="font-semibold text-foreground">1 credit</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your available credits</span>
              <span className={`font-semibold ${availableCredits < 1 ? 'text-red-600' : 'text-green-600'}`}>
                {availableCredits} credit{availableCredits !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          {availableCredits < 1 && (
            <p className="text-sm font-medium text-red-600">You do not have enough credits to unlock this CV.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingUnlock(false)}>Cancel</Button>
            <Button onClick={confirmUnlock} disabled={availableCredits < 1}>Unlock CV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
