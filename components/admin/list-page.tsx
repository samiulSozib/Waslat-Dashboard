'use client';

import { cn } from '@/lib/utils';
import { PageHeader } from './page-header';

type ListPageProps = {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    toolbar?: React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
    loading?: boolean;
    className?: string;
};

/** Standard Waslat list page: header → toolbar → scrollable table → footer */
export function ListPage({ title, description, actions, toolbar, children, footer, loading, className }: ListPageProps) {
    return (
        <div className={cn('space-y-4', className)}>
            <PageHeader title={title} description={description} actions={actions} />
            {toolbar}
            <div className="waslat-panel relative overflow-hidden">
                {loading ? <div className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-emerald-600" /> : null}
                <div className="waslat-table-scroll overflow-x-auto overscroll-x-contain">{children}</div>
                {footer}
            </div>
        </div>
    );
}
