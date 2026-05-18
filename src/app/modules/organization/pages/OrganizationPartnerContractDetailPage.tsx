import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Briefcase, CalendarDays, FileText } from 'lucide-react';
import { PageBanner } from '@app/components/PageBanner';
import { PageContainer } from '@app/components/PageContainer';
import { OrganizationsSubMenu } from '@app/components/OrganizationsSubMenu';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@app/components/ui/card';
import {
  getOrganizationPartnerContract,
  type OrganizationPartnerContract,
} from '@app/services/organizationPartnerContracts.service';

const formatDate = (value?: string) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function OrganizationPartnerContractDetailPage() {
  const navigate = useNavigate();
  const { organizationId = '', partnerId = '', contractId = '' } = useParams<{
    organizationId: string;
    partnerId: string;
    contractId: string;
  }>();
  const [contract, setContract] = useState<OrganizationPartnerContract | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadContract = async () => {
      setIsLoading(true);
      const item = await getOrganizationPartnerContract(contractId);
      if (!cancelled) {
        setContract(item);
        setIsLoading(false);
      }
    };
    loadContract();
    return () => {
      cancelled = true;
    };
  }, [contractId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageBanner
        icon={Briefcase}
        title={contract?.title || 'Contract Details'}
        description={contract ? `${contract.organizationName} and ${contract.partnerName}` : 'Partner contract'}
      />
      <PageContainer>
        <OrganizationsSubMenu />

        <Button type="button" variant="outline" className="mt-6" onClick={() => navigate(`/organizations/${organizationId}/partners/${partnerId}/contracts`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to contracts
        </Button>

        {isLoading && (
          <Card className="mt-6">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">Loading contract...</CardContent>
          </Card>
        )}

        {!isLoading && !contract && (
          <Card className="mt-6">
            <CardContent className="p-10 text-center">
              <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="font-semibold text-primary">Contract not found</p>
              <p className="mt-1 text-sm text-muted-foreground">This contract could not be found or is no longer available.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && contract && (
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{contract.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reference</p>
                    <p className="mt-1 font-semibold text-primary">{contract.reference}</p>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                    <Badge variant="outline" className="mt-1">{contract.status}</Badge>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start date</p>
                    <p className="mt-1 inline-flex items-center gap-1 font-semibold text-primary">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(contract.startDate)}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">End date</p>
                    <p className="mt-1 font-semibold text-primary">{formatDate(contract.endDate)}</p>
                  </div>
                </div>
                {contract.relatedProjectId && (
                  <div className="rounded-lg border bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Related project</p>
                    <Link to={`/projects/${contract.relatedProjectId}`} className="mt-1 inline-block font-semibold text-accent underline-offset-2 hover:underline">
                      {contract.relatedProjectName}
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Organization</p>
                  <p className="font-semibold text-primary">{contract.organizationName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Partner</p>
                  <p className="font-semibold text-primary">{contract.partnerName}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
