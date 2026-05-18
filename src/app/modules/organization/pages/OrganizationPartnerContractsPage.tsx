import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Briefcase, CalendarDays, ExternalLink, FileText } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent } from '@app/components/ui/card';
import {
  getOrganizationPartnerContracts,
  type OrganizationPartnerContract,
} from '@app/services/organizationPartnerContracts.service';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const statusClassName = (status: string) => {
  if (status === 'Active') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'Awarded') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'Completed') return 'border-slate-200 bg-slate-50 text-slate-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
};

export default function OrganizationPartnerContractsPage() {
  const navigate = useNavigate();
  const { organizationId = '', partnerId = '' } = useParams<{ organizationId: string; partnerId: string }>();
  const [contracts, setContracts] = useState<OrganizationPartnerContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadContracts = async () => {
      setIsLoading(true);
      setError('');
      try {
        const items = await getOrganizationPartnerContracts(organizationId, partnerId);
        if (!cancelled) setContracts(items);
      } catch (err) {
        if (!cancelled) setError('Unable to load contracts for this partner.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadContracts();
    return () => {
      cancelled = true;
    };
  }, [organizationId, partnerId]);

  const organizationName = contracts[0]?.organizationName || 'Selected organization';
  const partnerName = contracts[0]?.partnerName || partnerId.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Briefcase}
        title="Partner Contracts"
        description={`${organizationName} and ${partnerName}`}
        stats={[
          { value: contracts.length, label: 'Total contracts' },
          { value: organizationName, label: 'Organization' },
          { value: partnerName, label: 'Partner' },
        ]}
      />
      <PageContainer>
        <OrganizationsSubMenu />

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" className="w-fit" onClick={() => navigate(`/organizations/${organizationId}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to organization
          </Button>
          <Badge variant="outline" className="w-fit border-[#E63462]/25 bg-white text-[#E63462]">
            {contracts.length} contracts
          </Badge>
        </div>

        <Card className="mt-6">
          <CardContent className="p-0">
            {isLoading && (
              <div className="p-10 text-center text-sm text-muted-foreground">Loading contracts...</div>
            )}

            {!isLoading && error && (
              <div className="p-10 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-semibold text-primary">{error}</p>
                <Button className="mt-4" variant="outline" onClick={() => navigate(0)}>Try again</Button>
              </div>
            )}

            {!isLoading && !error && contracts.length === 0 && (
              <div className="p-10 text-center">
                <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="font-semibold text-primary">No contracts found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  There are no recorded contracts between this organization and partner yet.
                </p>
              </div>
            )}

            {!isLoading && !error && contracts.length > 0 && (
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_0.8fr] gap-4 border-b bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Contract</span>
                    <span>Reference</span>
                    <span>Status</span>
                    <span>Dates</span>
                    <span>Related project</span>
                    <span>Action</span>
                  </div>
                  {contracts.map(contract => (
                    <div key={contract.id} className="grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_0.8fr] gap-4 border-b px-5 py-4 text-sm last:border-b-0">
                      <div>
                        <p className="font-semibold text-primary">{contract.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">ID: {contract.id}</p>
                      </div>
                      <p className="font-medium text-foreground">{contract.reference}</p>
                      <Badge variant="outline" className={`h-fit w-fit ${statusClassName(contract.status)}`}>{contract.status}</Badge>
                      <div className="text-muted-foreground">
                        <p className="inline-flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatDate(contract.startDate)}
                        </p>
                        <p className="mt-1 text-xs">to {formatDate(contract.endDate)}</p>
                      </div>
                      <div>
                        {contract.relatedProjectId ? (
                          <Link to={`/projects/${contract.relatedProjectId}`} className="font-medium text-accent underline-offset-2 hover:underline">
                            {contract.relatedProjectName}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/organizations/${organizationId}/partners/${partnerId}/contracts/${contract.id}`}>
                          View
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
      </PageContainer>
    </div>
  );
}
