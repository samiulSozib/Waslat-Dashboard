'use client';

import { cn } from '@/lib/utils';

type FilterFieldProps = {
    label: string;
    children: React.ReactNode;
    className?: string;
};

/** Compact label + control for filter Sheets */
export function FilterField({ label, children, className }: FilterFieldProps) {
    return (
        <div className={cn('space-y-1 text-start', className)}>
            <label className="block text-xs font-medium text-foreground">{label}</label>
            {children}
        </div>
    );
}

/** Standard dense body spacing inside filter Sheets */
export const FILTER_SHEET_BODY_CLASS = 'mt-3 space-y-2.5';
