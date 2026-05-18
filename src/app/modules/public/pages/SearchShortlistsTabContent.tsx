import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Download,
  ListChecks,
  MapPin,
  Search,
  DollarSign,
  Briefcase,
  Users,
  Calendar,
  Star,
  Hash,
  FileText,
} from 'lucide-react';
import { useLanguage } from '@app/contexts/LanguageContext';
import { useAuth } from '@app/contexts/AuthContext';
import { Badge } from '@app/components/ui/badge';
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { organizationService } from '@app/services/organizationService';

interface ShortlistRow {
  id: number;
  tenderId: number | null;
  tenderTitle: string;
  project: string;
  location: string;
  donor: string;
  role: string;
  budget: number | null;
  status: string;
  rank: number | null;
  score: number | null;
  shortlistedAt: string | null;
  comments: string | null;
  organizationName: string;
}

function formatBudget(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'REJECTED':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function SearchShortlistsTabContent() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();

  const [rows, setRows] = useState<ShortlistRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    organizationService
      .getMyShortlists()
      .then((data: any[]) => {
        const mapped: ShortlistRow[] = (data || []).map((item: any) => ({
          id: item.id,
          tenderId: item.tenderId ?? null,
          tenderTitle: item.tenderTitle || item.project || 'N/A',
          project: item.project || item.tenderTitle || 'N/A',
          location: item.location || 'N/A',
          donor: item.donor || item.organizationName || 'N/A',
          role: item.role || 'Lead',
          budget: item.budget != null ? Number(item.budget) : null,
          status: item.status || 'ACTIVE',
          rank: item.rank ?? null,
          score: item.score != null ? Number(item.score) : null,
          shortlistedAt: item.shortlistedAt || null,
          comments: item.comments || null,
          organizationName: item.organizationName || '',
        }));
        setRows(mapped);
      })
      .catch((err) => {
        console.error('Error fetching shortlists:', err);
        setError('Failed to load shortlists. Please try again.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isAuthenticated]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      (row) =>
        row.project.toLowerCase().includes(q) ||
        row.tenderTitle.toLowerCase().includes(q) ||
        row.location.toLowerCase().includes(q) ||
        row.donor.toLowerCase().includes(q) ||
        row.role.toLowerCase().includes(q) ||
        (row.status && row.status.toLowerCase().includes(q)) ||
        (row.comments && row.comments.toLowerCase().includes(q)),
    );
  }, [rows, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const exportCsv = () => {
    const header = ['Project', 'Location', 'Donor', 'Role', 'Budget', 'Status', 'Rank', 'Score', 'Shortlisted At'];
    const csvRows = filteredRows.map((row) =>
      [
        row.project,
        row.location,
        row.donor,
        row.role,
        formatBudget(row.budget),
        row.status,
        row.rank ?? '',
        row.score ?? '',
        row.shortlistedAt ? format(new Date(row.shortlistedAt), 'yyyy-MM-dd') : '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(','),
    );
    const csv = [header.join(','), ...csvRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shortlists.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ─── Not authenticated ─── */
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ListChecks className="h-14 w-14 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Organization Account Required</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Please sign in with an organization account to view your shortlisted tenders.
        </p>
      </div>
    );
  }

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-sm text-muted-foreground">Loading your shortlists…</p>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <ListChecks className="h-12 w-12 text-red-300 mb-3" />
        <p className="text-sm text-red-500">{error}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setIsLoading(true);
            setError(null);
            organizationService
              .getMyShortlists()
              .then((data: any[]) => {
                setRows(
                  (data || []).map((item: any) => ({
                    id: item.id,
                    tenderId: item.tenderId ?? null,
                    tenderTitle: item.tenderTitle || item.project || 'N/A',
                    project: item.project || item.tenderTitle || 'N/A',
                    location: item.location || 'N/A',
                    donor: item.donor || 'N/A',
                    role: item.role || 'Lead',
                    budget: item.budget != null ? Number(item.budget) : null,
                    status: item.status || 'ACTIVE',
                    rank: item.rank ?? null,
                    score: item.score != null ? Number(item.score) : null,
                    shortlistedAt: item.shortlistedAt || null,
                    comments: item.comments || null,
                    organizationName: item.organizationName || '',
                  })),
                );
              })
              .catch(() => setError('Failed to load shortlists. Please try again.'))
              .finally(() => setIsLoading(false));
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search / Actions bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-primary flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-accent" />
              My Organisation Shortlists
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Tenders shortlisted by your organisation
            </p>
          </div>
          <Badge variant="secondary">{rows.length} shortlist{rows.length !== 1 ? 's' : ''}</Badge>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <Input
            id="shortlists-search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by project, location, donor, role…"
            className="flex-1 min-h-11"
          />
          <Button type="submit" className="min-h-11 px-5">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={exportCsv} disabled={filteredRows.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
        </form>

        {searchQuery && (
          <p className="text-xs text-gray-500 mt-2">
            Showing {filteredRows.length} of {rows.length} results for &quot;{searchQuery}&quot;{' '}
            <button
              className="text-accent underline ml-1"
              type="button"
              onClick={() => { setSearchQuery(''); setSearchInput(''); }}
            >
              Clear
            </button>
          </p>
        )}
      </div>

      {/* Empty state */}
      {filteredRows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-lg border border-gray-200">
          <ListChecks className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-gray-600 mb-1">
            {searchQuery ? 'No matching shortlists' : 'No shortlists yet'}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">
            {searchQuery
              ? 'Try adjusting your search terms.'
              : 'Your organisation has not shortlisted any tenders yet.'}
          </p>
        </div>
      ) : (
        /* Table */
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" /> Project / Tender
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> Location
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5" /> Donor
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" /> Role
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5" /> Budget
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" /> Status
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" /> Rank
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5" /> Score
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Shortlisted
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-primary line-clamp-2 max-w-[260px]">{row.project}</p>
                      {row.comments && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{row.comments}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.location}</td>
                    <td className="px-4 py-3 text-gray-600">{row.donor}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="text-xs font-medium">{row.role}</Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700 whitespace-nowrap">{formatBudget(row.budget)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(row.status)} className="text-xs capitalize">
                        {row.status?.toLowerCase() ?? 'active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">{row.rank ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-center">
                      {row.score != null ? row.score.toFixed(1) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {row.shortlistedAt
                        ? format(new Date(row.shortlistedAt), 'dd MMM yyyy')
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer summary */}
          <div className="border-t border-gray-100 px-4 py-3 bg-gray-50/50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {filteredRows.length} shortlist{filteredRows.length !== 1 ? 's' : ''}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
            {filteredRows.length > 0 && (
              <p className="text-xs text-gray-400">
                Total budget:{' '}
                <span className="font-medium text-gray-600">
                  {formatBudget(
                    filteredRows.reduce((sum, r) => sum + (r.budget ?? 0), 0),
                  )}
                </span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
