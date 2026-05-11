import { Database } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { ExpertsSubMenu } from '@app/components/ExpertsSubMenu';
import { EXPERT_SEARCH_TOTAL } from '@app/modules/expert/data/expertSearchFilters';
import { ExpertWorkspaceTabs } from '@app/modules/expert/components/ExpertWorkspaceTabs';
import { ExpertsSearchFiltersWorkspace } from './ExpertsDatabase';

export default function ExpertSearchPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PageBanner
        title="Search Experts"
        description={`Discover and evaluate experts across ${EXPERT_SEARCH_TOTAL.toLocaleString()} professional CVs.`}
        icon={Database}
      />
      <ExpertsSubMenu />
      <PageContainer className="my-6">
        <div className="space-y-5 px-4 py-6">
          <ExpertWorkspaceTabs />
          <ExpertsSearchFiltersWorkspace />
        </div>
      </PageContainer>
    </div>
  );
}
