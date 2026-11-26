'use client';

import { cn } from '@/lib/utils';

type AdminTableProps = {
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
    minWidth?: string;
};

export function AdminTable({ children, loading, className, minWidth = '900px' }: AdminTableProps) {
    return (
        <div className={cn('waslat-panel overflow-hidden', className)}>
            <div className="relative overflow-x-auto">
                {loading ? <div className="absolute inset-x-0 top-0 z-10 h-0.5 animate-pulse bg-emerald-600" /> : null}
                <table className="w-full border-collapse text-sm" style={{ minWidth }}>
                    {children}
                </table>
            </div>
        </div>
    );
}

export function AdminThead({ children }: { children: React.ReactNode }) {
    return (
        <thead>
            <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">{children}</tr>
        </thead>
    );
}

export function AdminTh({ children, className }: { children?: React.ReactNode; className?: string }) {
    return <th className={cn('px-3 py-3 text-xs font-semibold text-emerald-950', className)}>{children}</th>;
}

export function AdminTd({ children, className, onClick }: { children?: React.ReactNode; className?: string; onClick?: () => void }) {
    return (
        <td className={cn('border-b border-emerald-50 px-3 py-3 text-start align-middle', className)} onClick={onClick}>
            {children}
        </td>
    );
}

export function AdminPagination({
    page = 1,
    totalPages = 1,
    total = 0,
    onPrev,
    onNext
}: {
    page?: number;
    totalPages?: number;
    total?: number;
    onPrev: () => void;
    onNext: () => void;
}) {
    return (
        <div className="flex flex-col gap-3 border-t border-emerald-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
                صفحه {page} از {totalPages} · مجموع {total}
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                    disabled={page <= 1}
                    onClick={onPrev}
                >
                    قبلی
                </button>
                <button
                    type="button"
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-sm disabled:opacity-40"
                    disabled={page >= totalPages}
                    onClick={onNext}
                >
                    بعدی
                </button>
            </div>
        </div>
    );
}
