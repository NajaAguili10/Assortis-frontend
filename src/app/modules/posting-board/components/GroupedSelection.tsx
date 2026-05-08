import React, { useMemo, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Checkbox } from '../../../components/ui/checkbox';
import { Input } from '../../../components/ui/input';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';

export interface SelectionGroup {
  label: string;
  options: string[];
}

interface GroupedSelectionProps {
  title: string;
  groupLabel: string;
  optionLabel: string;
  groups: SelectionGroup[];
  selectedGroups: string[];
  selectedOptions: string[];
  onSelectedGroupsChange: (values: string[]) => void;
  onSelectedOptionsChange: (values: string[]) => void;
  includeHomeBased?: boolean;
  homeBased?: boolean;
  onHomeBasedChange?: (value: boolean) => void;
}

const toggleValue = (values: string[], value: string) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export function GroupedSelection({
  title,
  groupLabel,
  optionLabel,
  groups,
  selectedGroups,
  selectedOptions,
  onSelectedGroupsChange,
  onSelectedOptionsChange,
  includeHomeBased,
  homeBased,
  onHomeBasedChange,
}: GroupedSelectionProps) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<string[]>(() => groups.slice(0, 2).map((group) => group.label));

  const filteredGroups = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return groups;

    return groups
      .map((group) => ({
        ...group,
        options: group.options.filter((option) => option.toLowerCase().includes(normalized)),
      }))
      .filter((group) => group.label.toLowerCase().includes(normalized) || group.options.length > 0);
  }, [groups, query]);

  const allGroupLabels = groups.map((group) => group.label);
  const allOptions = groups.flatMap((group) => group.options);

  const selectAllGroups = () => {
    const allSelected = allGroupLabels.every((group) => selectedGroups.includes(group));
    onSelectedGroupsChange(allSelected ? [] : allGroupLabels);
  };

  const toggleGroup = (group: SelectionGroup) => {
    onSelectedGroupsChange(toggleValue(selectedGroups, group.label));
    if (!expanded.includes(group.label)) setExpanded((current) => [...current, group.label]);
  };

  const toggleAllOptionsInGroup = (group: SelectionGroup) => {
    const allSelected = group.options.every((option) => selectedOptions.includes(option));
    onSelectedOptionsChange(
      allSelected
        ? selectedOptions.filter((option) => !group.options.includes(option))
        : Array.from(new Set([...selectedOptions, ...group.options])),
    );
  };

  const selectedCount = selectedGroups.length + selectedOptions.length + (homeBased ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="text-sm font-semibold text-primary">{title}</h4>
          <p className="text-xs text-muted-foreground">{selectedCount} selected</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={selectAllGroups}>
          {allGroupLabels.every((group) => selectedGroups.includes(group)) ? 'Unselect all' : `Select all ${groupLabel.toLowerCase()}s`}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${groupLabel.toLowerCase()}s and ${optionLabel.toLowerCase()}s`} className="pl-9" />
      </div>

      {includeHomeBased && (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border bg-white px-3 py-2 text-sm">
          <Checkbox checked={Boolean(homeBased)} onCheckedChange={(checked) => onHomeBasedChange?.(Boolean(checked))} />
          <span className="font-medium">Home-Based</span>
        </label>
      )}

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="max-h-[420px] overflow-y-auto rounded-lg border bg-white">
          {filteredGroups.map((group) => {
            const isExpanded = expanded.includes(group.label);
            const selectedChildren = group.options.filter((option) => selectedOptions.includes(option)).length;

            return (
              <div key={group.label} className="border-b last:border-b-0">
                <div className="flex items-center gap-2 px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setExpanded((current) => toggleValue(current, group.label))}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  <Checkbox checked={selectedGroups.includes(group.label)} onCheckedChange={() => toggleGroup(group)} />
                  <button type="button" className="min-w-0 flex-1 text-left text-sm font-medium" onClick={() => toggleGroup(group)}>
                    <span className="truncate">{group.label}</span>
                  </button>
                  <Badge variant="secondary" className="shrink-0">{selectedChildren}/{group.options.length}</Badge>
                </div>
                {isExpanded && (
                  <div className="space-y-1 border-t bg-slate-50 px-3 py-2">
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleAllOptionsInGroup(group)}>
                      {group.options.every((option) => selectedOptions.includes(option)) ? 'Unselect all' : `Select all ${optionLabel.toLowerCase()}s`}
                    </Button>
                    {group.options.map((option) => (
                      <label key={option} className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-white">
                        <Checkbox checked={selectedOptions.includes(option)} onCheckedChange={() => onSelectedOptionsChange(toggleValue(selectedOptions, option))} className="mt-0.5" />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-lg border bg-white p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Selected</p>
          <div className="flex max-h-[390px] flex-wrap gap-2 overflow-y-auto">
            {selectedCount === 0 ? (
              <p className="text-sm text-muted-foreground">No selection yet.</p>
            ) : (
              <>
                {homeBased && <Badge variant="secondary">Home-Based</Badge>}
                {selectedGroups.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}
                {selectedOptions.map((item) => <Badge key={item} variant="secondary">{item}</Badge>)}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
