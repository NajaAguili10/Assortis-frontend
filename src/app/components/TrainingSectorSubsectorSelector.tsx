import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Check } from 'lucide-react';

import { Alert, AlertDescription } from '@app/components/ui/alert';
import { Badge } from '@app/components/ui/badge';
import { Checkbox } from '@app/components/ui/checkbox';

import {
    getOrganizationSectors,
    getOrganizationSubsectorsBySector,
    type OrganizationSector,
    type OrganizationSubsector,
} from '@app/services/organizationTrainingTaxonomyService';

import type { UpcomingTraining } from '@app/services/upcomingTrainingService';

interface TrainingSectorSubsectorSelectorProps {
    trainings: UpcomingTraining[];
    selectedSectorIds: number[];
    selectedSubsectorIds: number[];
    onSelectionChange: (selection: {
        sectorIds: number[];
        subsectorIds: number[];
    }) => void;
}

const normalize = (value: string | null | undefined): string =>
    (value || '').trim().toLowerCase().replace(/_/g, ' ');

const sectorMatchesTraining = (
    sector: OrganizationSector,
    training: UpcomingTraining
): boolean => {
    return (training.sectors || []).some((trainingSector) => {
        return (
            trainingSector.id === sector.id ||
            normalize(trainingSector.code) === normalize(sector.code) ||
            normalize(trainingSector.name) === normalize(sector.name)
        );
    });
};

export function TrainingSectorSubsectorSelector({
                                                    trainings,
                                                    selectedSectorIds,
                                                    selectedSubsectorIds,
                                                    onSelectionChange,
                                                }: TrainingSectorSubsectorSelectorProps) {
    const [sectors, setSectors] = useState<OrganizationSector[]>([]);
    const [subsectorsBySectorId, setSubsectorsBySectorId] = useState<
        Record<number, OrganizationSubsector[]>
    >({});

    const [activeSector, setActiveSector] =
        useState<OrganizationSector | null>(null);


    const [loadingSectors, setLoadingSectors] = useState(true);
    const [loadingSubsectors, setLoadingSubsectors] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadSectors = async () => {
            setLoadingSectors(true);
            setError('');

            try {
                const data = await getOrganizationSectors();
                setSectors(data || []);
            } catch (err: any) {
                setError(err.message || 'Unable to load sectors');
            } finally {
                setLoadingSectors(false);
            }
        };

        loadSectors();
    }, []);

    useEffect(() => {
        const loadSubsectorsForActiveSector = async () => {
            if (!activeSector) return;

            if (subsectorsBySectorId[activeSector.id]) return;

            setLoadingSubsectors(true);
            setError('');

            try {
                const data = await getOrganizationSubsectorsBySector(activeSector.id);

                setSubsectorsBySectorId((current) => ({
                    ...current,
                    [activeSector.id]: data || [],
                }));
            } catch (err: any) {
                setError(err.message || 'Unable to load subsectors');
            } finally {
                setLoadingSubsectors(false);
            }
        };

        loadSubsectorsForActiveSector();
    }, [activeSector, subsectorsBySectorId]);

    const activeSubsectors = activeSector
        ? subsectorsBySectorId[activeSector.id] || []
        : [];

    const sectorCourseCountById = useMemo(() => {
        const counts = new Map<number, number>();

        sectors.forEach((sector) => {
            const count = trainings.filter((training) =>
                sectorMatchesTraining(sector, training)
            ).length;

            counts.set(sector.id, count);
        });

        return counts;
    }, [sectors, trainings]);

    const toggleSector = (sector: OrganizationSector) => {
        setActiveSector(sector);

        const nextSectorIds = selectedSectorIds.includes(sector.id)
            ? selectedSectorIds.filter((id) => id !== sector.id)
            : [...selectedSectorIds, sector.id];

        onSelectionChange({
            sectorIds: nextSectorIds,
            subsectorIds: selectedSubsectorIds,
        });
    };

    const toggleSubsector = (subsectorId: number) => {
        const nextSubsectorIds = selectedSubsectorIds.includes(subsectorId)
            ? selectedSubsectorIds.filter((id) => id !== subsectorId)
            : [...selectedSubsectorIds, subsectorId];

        onSelectionChange({
            sectorIds: selectedSectorIds,
            subsectorIds: nextSubsectorIds,
        });
    };

    const toggleAllSectors = () => {
        if (selectedSectorIds.length === sectors.length) {
            onSelectionChange({
                sectorIds: [],
                subsectorIds: [],
            });
            setActiveSector(null);
            return;
        }

        const nextSectorIds = sectors.map((sector) => sector.id);

        onSelectionChange({
            sectorIds: nextSectorIds,
            subsectorIds: selectedSubsectorIds,
        });

        if (!activeSector && sectors.length > 0) {
            setActiveSector(sectors[0]);
        }
    };

    const toggleAllActiveSubsectors = () => {
        const activeIds = activeSubsectors.map((item) => item.id);

        const allSelected =
            activeIds.length > 0 &&
            activeIds.every((id) => selectedSubsectorIds.includes(id));

        const nextSubsectorIds = allSelected
            ? selectedSubsectorIds.filter((id) => !activeIds.includes(id))
            : [
                ...selectedSubsectorIds,
                ...activeIds.filter((id) => !selectedSubsectorIds.includes(id)),
            ];

        onSelectionChange({
            sectorIds: selectedSectorIds,
            subsectorIds: nextSubsectorIds,
        });
    };
    return (
        <section className="mb-6">
            {error && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                    <BriefcaseBusiness className="w-5 h-5 text-[#B82547]" />
                </div>

                <div>
                    <h3 className="font-semibold text-primary">
                        Sector &amp; Subsector
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        Select one or more sectors to view their subsectors
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b p-4 flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#B82547] flex items-center justify-center">
                                <BriefcaseBusiness className="w-4 h-4 text-white" />
                            </div>

                            <div>
                                <h4 className="font-semibold text-primary">
                                    Sector
                                </h4>

                                <p className="text-xs text-muted-foreground">
                                    {loadingSectors
                                        ? 'Loading...'
                                        : `${sectors.length} available`}
                                </p>

                                {selectedSectorIds.length > 0 && (
                                    <Badge className="mt-2 bg-[#B82547] text-white hover:bg-[#B82547]">
                                        {selectedSectorIds.length} selected
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            className="text-xs font-medium text-primary"
                            onClick={toggleAllSectors}
                        >
                            {selectedSectorIds.length === sectors.length
                                ? 'Deselect All'
                                : 'Select All'}
                        </button>
                    </div>

                    <div className="p-3 space-y-2 min-h-[350px]">
                        {loadingSectors ? (
                            <p className="text-sm text-muted-foreground p-3">
                                Loading sectors...
                            </p>
                        ) : (
                            sectors.map((sector) => {
                                const isSelected = selectedSectorIds.includes(
                                    sector.id
                                );

                                const isActive = activeSector?.id === sector.id;

                                return (
                                    <button
                                        key={sector.id}
                                        type="button"
                                        onClick={() => toggleSector(sector)}
                                        className={[
                                            'w-full rounded-lg border p-3 flex items-center gap-3 transition-all text-left',
                                            isSelected
                                                ? 'border-[#B82547] bg-rose-50 shadow-sm'
                                                : 'border-slate-200 bg-white hover:border-slate-300',
                                            isActive ? 'ring-2 ring-rose-100' : '',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'w-5 h-5 rounded border flex items-center justify-center',
                                                isSelected
                                                    ? 'bg-[#B82547] border-[#B82547]'
                                                    : 'border-slate-300 bg-white',
                                            ].join(' ')}
                                        >
                                            {isSelected && (
                                                <Check className="w-3.5 h-3.5 text-white" />
                                            )}
                                        </span>

                                        <span className="font-semibold text-sm text-primary flex-1">
                                            {sector.name}
                                        </span>

                                        <Badge
                                            variant="outline"
                                            className="rounded-full bg-white"
                                        >
                                            {sectorCourseCountById.get(sector.id) ??
                                                0}
                                        </Badge>

                                        {isActive && (
                                            <span className="w-8 h-8 rounded-lg bg-[#B82547] flex items-center justify-center">
                                                <ArrowRight className="w-4 h-4 text-white" />
                                            </span>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                    <div className="bg-slate-50 border-b p-4 flex items-start justify-between">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#B82547] flex items-center justify-center">
                                <BriefcaseBusiness className="w-4 h-4 text-white" />
                            </div>

                            <div>
                                <h4 className="font-semibold text-primary">
                                    Subsector
                                </h4>

                                <p className="text-xs text-muted-foreground">
                                    {activeSector
                                        ? `${activeSubsectors.length} available`
                                        : 'Select a sector first'}
                                </p>
                            </div>
                        </div>

                        {activeSector && activeSubsectors.length > 0 && (
                            <button
                                type="button"
                                className="text-xs font-medium text-primary"
                                onClick={toggleAllActiveSubsectors}
                            >
                                Select All
                            </button>
                        )}
                    </div>

                    <div className="p-3 min-h-[350px]">
                        {!activeSector ? (
                            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                    <BriefcaseBusiness className="w-10 h-10 text-slate-400" />
                                </div>

                                <h4 className="font-semibold text-primary mb-2">
                                    Select a sector to view its subsectors
                                </h4>

                                <p className="text-sm text-muted-foreground max-w-xs">
                                    Click on a sector from the left column to view
                                    and select its associated subsectors
                                </p>
                            </div>
                        ) : loadingSubsectors ? (
                            <p className="text-sm text-muted-foreground p-3">
                                Loading subsectors...
                            </p>
                        ) : (
                            <div className="space-y-2">
                                <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 flex items-center gap-2 mb-4">
                                    <BriefcaseBusiness className="w-4 h-4 text-[#B82547]" />

                                    <span className="font-semibold text-sm text-primary">
                                        {activeSector.name}
                                    </span>
                                </div>

                                {activeSubsectors.map((subsector) => {
                                    const isSelected =
                                        selectedSubsectorIds.includes(
                                            subsector.id
                                        );

                                    return (
                                        <label
                                            key={subsector.id}
                                            className="rounded-lg border border-slate-200 p-3 flex items-center gap-3 cursor-pointer hover:border-slate-300"
                                        >
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() =>
                                                    toggleSubsector(subsector.id)
                                                }
                                            />

                                            <span className="font-medium text-sm text-primary">
                                                {subsector.name}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}