'use client';

import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatCardProps = {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
    icon: LucideIcon;
    onClick?: () => void;
    className?: string;
    tone?: 'primary' | 'amber' | 'rose' | 'sky' | 'slate';
};

const tones: Record<NonNullable<StatCardProps['tone']>, string> = {
    primary: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    slate: 'bg-slate-100 text-slate-700'
};

export function StatCard({ label, value, hint, icon: Icon, onClick, className, tone = 'primary' }: StatCardProps) {
    return (
        <div
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={
                onClick
                    ? (e) => {
                          if (e.key === 'Enter' || e.key === ' ') onClick();
                      }
                    : undefined
            }
            className={cn(
                'waslat-panel flex w-full flex-col gap-3 p-4 text-start transition hover:-translate-y-0.5 hover:shadow-md',
                onClick && 'cursor-pointer',
                className
            )}
        >
            <div className="flex items-start gap-3">
                {/* First in DOM = start edge in RTL (right) — keeps icon clear of labels */}
                <div
                    className={cn('waslat-stat-icon flex shrink-0 items-center justify-center rounded-xl', tones[tone])}
                    aria-hidden
                >
                    <Icon className="waslat-nav-icon" />
                </div>
                <div className="min-w-0 flex-1 space-y-1 text-start">
                    <div className="text-xs font-medium text-muted-foreground">{label}</div>
                    <div className="truncate text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value ?? '—'}</div>
                    {hint ? <div className="text-xs text-muted-foreground">{hint}</div> : null}
                </div>
            </div>
        </div>
    );
}
