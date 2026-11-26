'use client';

import { cn } from '@/lib/utils';

type PageHeaderProps = {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    className?: string;
};

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn('mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between', className)}>
            <div className="min-w-0 text-start">
                <h1 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{title}</h1>
                {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
    );
}
