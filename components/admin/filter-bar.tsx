'use client';

import { Filter, RotateCcw, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FilterChip = {
    key: string;
    label: string;
};

type FilterBarProps = {
    search: string;
    onSearchChange: (value: string) => void;
    searchPlaceholder?: string;
    chips?: FilterChip[];
    onRemoveChip?: (key: string) => void;
    onClearAll?: () => void;
    onOpenFilters?: () => void;
    extraActions?: React.ReactNode;
    className?: string;
};

export function FilterBar({
    search,
    onSearchChange,
    searchPlaceholder = 'جستجو...',
    chips = [],
    onRemoveChip,
    onClearAll,
    onOpenFilters,
    extraActions,
    className
}: FilterBarProps) {
    return (
        <div className={cn('waslat-panel space-y-3 p-3 md:p-4', className)}>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="ps-9"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {onOpenFilters ? (
                        <Button type="button" variant="outline" size="sm" onClick={onOpenFilters}>
                            <Filter className="h-4 w-4" />
                            فیلترها
                            {chips.length > 0 ? <Badge className="ms-1">{chips.length}</Badge> : null}
                        </Button>
                    ) : null}
                    {chips.length > 0 && onClearAll ? (
                        <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
                            <RotateCcw className="h-4 w-4" />
                            پاک‌سازی
                        </Button>
                    ) : null}
                    {extraActions}
                </div>
            </div>

            {chips.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {chips.map((chip) => (
                        <Badge key={chip.key} variant="secondary" className="gap-1 pe-1">
                            <span>{chip.label}</span>
                            {onRemoveChip ? (
                                <button
                                    type="button"
                                    className="rounded-sm p-0.5 hover:bg-black/5"
                                    onClick={() => onRemoveChip(chip.key)}
                                    aria-label="حذف فیلتر"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            ) : null}
                        </Badge>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
