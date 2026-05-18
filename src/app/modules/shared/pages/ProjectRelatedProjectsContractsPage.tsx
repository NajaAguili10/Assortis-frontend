import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Briefcase, ExternalLink, FolderKanban, Network } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import {
  getProjectRelationships,
  type EarlyIntelligenceRelatedItem,
  type ProjectRelationships,
} from '@app/services/projectRelationships.service';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

function RelatedItemsTable({ title, icon: Icon, items }: { title: string; icon: typeof FolderKanban; items: EarlyIntelligenceRelatedItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-[#E63462]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No related items found.</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[2fr_0.9fr_1fr_1.5fr_1fr_0.8fr] gap-4 border-y bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Name</span>
                <span>Status</span>
                <span>Phase</span>
                <span>Organization / Partner</span>
                <span>Date</span>
                <span>Action</span>
              </div>
              {items.map(item => (
                <div key={item.id} className="grid grid-cols-[2fr_0.9fr_1fr_1.5fr_1fr_0.8fr] gap-4 border-b px-5 py-4 text-sm last:border-b-0">
                  <p className="font-semibold text-primary">{item.name}</p>
                  <Badge variant="outline" className="h-fit w-fit">{item.status}</Badge>
                  <p className="text-muted-foreground">{item.phase}</p>
                  <div className="text-muted-foreground">
                    <p>{item.organizationName || '-'}</p>
                    {item.partnerName && <p className="mt-1 text-xs">Partner: {item.partnerName}</p>}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.dateLabel || 'Date'}</p>
                    <p className="font-medium text-foreground">{formatDate(item.dateValue)}</p>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={item.detailPath}>
                      Open
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProjectRelatedProjectsContractsPage() {
  const navigate = useNavigate();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const [relationships, setRelationships] = useState<ProjectRelationships | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const loadRelationships = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getProjectRelationships(projectId);
        if (!cancelled) setRelationships(data);
      } catch (err) {
        if (!cancelled) setError('Unable to load related projects and contracts.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadRelationships();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const relatedProjectCount = relationships?.relatedProjects.length ?? 0;
  const relatedContractCount = relationships?.relatedContracts.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Network}
        title="Related Projects & Contracts"
        description="Early Intelligence relationship map"
        stats={[
          { value: relatedProjectCount, label: 'Related projects' },
          { value: relatedContractCount, label: 'Related contracts' },
        ]}
      />
      <PageContainer>
        <Button type="button" variant="outline" className="mt-6" onClick={() => navigate(`/projects/${projectId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to project
        </Button>

        {isLoading && (
          <Card className="mt-6">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">Loading related projects and contracts...</CardContent>
          </Card>
        )}

        {!isLoading && error && (
          <Card className="mt-6">
            <CardContent className="p-10 text-center">
              <p className="font-semibold text-primary">{error}</p>
              <Button className="mt-4" variant="outline" onClick={() => navigate(0)}>Try again</Button>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && relationships && (
          <div className="mt-6 space-y-6">
            <RelatedItemsTable title="Related projects" icon={FolderKanban} items={relationships.relatedProjects} />
            <RelatedItemsTable title="Related contracts" icon={Briefcase} items={relationships.relatedContracts} />
          </div>
        )}
      </PageContainer>
    </div>
  );
}
