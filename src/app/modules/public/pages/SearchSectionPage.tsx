import { Search } from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { SearchSectionTabs, type SearchSectionTab } from '@app/components/SearchSectionTabs';
import SearchAlertsTabContent from '@app/modules/public/pages/SearchAlertsTabContent';
import SearchOrganizationsTabContent from '@app/modules/public/pages/SearchOrganizationsTabContent';
import SearchProjectsTabContent from '@app/modules/public/pages/SearchProjectsTabContent';
import SearchExpertsTabContent from '@app/modules/public/pages/SearchExpertsTabContent';
import SearchMyExpertsContent from '@app/modules/public/pages/SearchMyExpertsContent';
import SearchMapTabContent from '@app/modules/public/pages/SearchMapTabContent';

type SectionType = SearchSectionTab;

interface SearchSectionPageProps {
  section: SectionType;
}

export default function SearchSectionPage({ section }: SearchSectionPageProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      <PageBanner
        title={t(`search.section.${section}.title`)}
        description={t(`search.section.${section}.description`)}
        icon={Search}
      />

      <SearchSectionTabs activeTab={section} />

      <PageContainer className="my-6">
        <div className="px-4 sm:px-5 lg:px-6 py-6 space-y-6">
          {section === 'map' && <SearchMapTabContent />}

          {section === 'projects' && <SearchProjectsTabContent />}

          {(section === 'awards' || section === 'shortlists') && (
            <SearchAlertsTabContent tab={section} />
          )}

          {section === 'organisations' && <SearchOrganizationsTabContent />}

          {section === 'experts' && <SearchExpertsTabContent mode="experts" />}
          {section === 'my-experts' && <SearchMyExpertsContent />}
          {section === 'bid-writers' && <SearchExpertsTabContent mode="bid-writers" />}
        </div>
      </PageContainer>
    </div>
  );
}
