import { Link } from 'react-router';
import { BarChart3, BriefcaseBusiness, FileText, FolderOpen, GraduationCap, Search, Users, Building2 } from 'lucide-react';
import { Button } from './ui/button';
import { PageContainer } from './PageContainer';
import { useTranslation } from '@app/contexts/LanguageContext';

export function OrganizationTendersLanding() {
  const { t } = useTranslation();

  return (
    <PageContainer className="my-6">
      <div className="px-4 sm:px-5 lg:px-6 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-primary">{t('tenders.overview.home.title')}</h2>
            <p className="text-sm text-gray-600 mt-1">
              {t('tenders.overview.home.subtitle')}
            </p>
          </div>
          <Button variant="outline" className="min-h-11" asChild>
            <Link to="/faq">{t('tenders.overview.home.faq')}</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.dailyAlerts.cardTitle')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.dailyAlerts.cardDescription')}</p>
            </div>
            <Button variant="destructive" className="w-full mt-4 min-h-11" asChild>
              <Link to="/calls/active">{t('tenders.overview.dailyAlerts.showMyAlerts')}</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <FolderOpen className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.projects.title')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.projects.description')}</p>
            </div>
            <Button variant="outline" className="w-full mt-4 min-h-11" asChild>
              <Link to="/projects/active">{t('tenders.overview.dailyAlerts.showMyProjects')}</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.searches.title')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.searches.description')}</p>
            </div>
            <Button variant="outline" className="w-full mt-4 min-h-11" asChild>
              <Link to="/search">{t('tenders.overview.dailyAlerts.showMySearches')}</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.expertsDatabase.title')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.expertsDatabase.description')}</p>
            </div>
            <Button variant="outline" className="w-full mt-4 min-h-11" asChild>
              <Link to="/search">{t('tenders.overview.expertsDatabase.showExperts')}</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <BarChart3 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.statistics.title')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.statistics.description')}</p>
            </div>
            <Button variant="outline" className="w-full mt-4 min-h-11" asChild>
              <Link to="/statistics/dashboard">{t('tenders.overview.statistics.cta')}</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <BriefcaseBusiness className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.postingBoard.title')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.postingBoard.description')}</p>
            </div>
            <Button variant="outline" className="w-full mt-4 min-h-11" asChild>
              <Link to="/posting-board">{t('tenders.overview.postingBoard.cta')}</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.training.title')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.training.description')}</p>
            </div>
            <Button variant="outline" className="w-full mt-4 min-h-11" asChild>
              <Link to="/training">{t('tenders.overview.training.cta')}</Link>
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="space-y-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
                <Building2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{t('tenders.overview.myOrganization.title')}</h3>
              <p className="text-sm text-slate-600">{t('tenders.overview.myOrganization.description')}</p>
            </div>
            <Button variant="outline" className="w-full mt-4 min-h-11" asChild>
              <Link to="/organizations/my-organization">{t('tenders.overview.myOrganization.cta')}</Link>
            </Button>
          </div>
        </div>

        <p className="mt-6 text-sm text-slate-600 text-center">
          {t('tenders.overview.home.contactPrompt')}{' '}
          <a href="mailto:team@assortis.com" className="text-red-600 font-medium hover:text-red-700 hover:underline">
            {t('tenders.overview.home.contactLink')}
          </a>
        </p>
      </div>
    </PageContainer>
  );
}
