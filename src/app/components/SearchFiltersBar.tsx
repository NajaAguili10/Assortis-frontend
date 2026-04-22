import { ReactNode } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface SearchFiltersBarProps {
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterLabel?: string;
  onFilterClick?: () => void;
  additionalFilters?: ReactNode;
}

/**
 * Standard search and filters bar component
 * Enforces consistent spacing: mb-6 (24px) separation from content below
 */
export function SearchFiltersBar({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterLabel = 'Filter',
  onFilterClick,
  additionalFilters,
}: SearchFiltersBarProps) {
  return (
    <div className="mb-6 flex gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {onFilterClick && (
        <Button variant="outline" className="gap-2" onClick={onFilterClick}>
          <Filter className="h-4 w-4" />
          {filterLabel}
        </Button>
      )}
      {additionalFilters}
    </div>
  );
}
