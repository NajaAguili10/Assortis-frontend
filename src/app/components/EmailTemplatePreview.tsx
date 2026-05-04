interface EmailTemplatePreviewProps {
  title: string;
  frequency: string;
  query?: string;
  filtersSummary?: string;
}

export function EmailTemplatePreview({ title, frequency, query, filtersSummary }: EmailTemplatePreviewProps) {
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Email preview</p>
      <h4 className="mt-2 font-semibold text-primary">{title}</h4>
      <p className="mt-1 text-muted-foreground">Frequency: {frequency}</p>
      {query && <p className="mt-2 text-gray-700">Search query: {query}</p>}
      {filtersSummary && <p className="mt-1 text-gray-700">Filters: {filtersSummary}</p>}
      <div className="mt-3 rounded-md bg-white p-3 text-gray-700">
        Matching opportunities found for your saved search will appear here. This is a client-side preview only; no email is sent.
      </div>
    </div>
  );
}
