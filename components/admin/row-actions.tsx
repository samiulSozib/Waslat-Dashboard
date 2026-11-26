'use client';

import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type RowActionItem = {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    danger?: boolean;
    hidden?: boolean;
    separatorBefore?: boolean;
};

type RowActionsProps = {
    items: RowActionItem[];
    className?: string;
};

export function RowActions({ items, className }: RowActionsProps) {
    const visible = items.filter((i) => !i.hidden);
    if (!visible.length) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn('h-8 w-8 shrink-0 border-emerald-200 bg-white hover:bg-emerald-50', className)}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">عملیات</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[11rem]" onClick={(e) => e.stopPropagation()}>
                {visible.map((item, idx) => (
                    <div key={`${item.label}-${idx}`}>
                        {item.separatorBefore ? <DropdownMenuSeparator /> : null}
                        <DropdownMenuItem
                            className={cn('gap-2', item.danger && 'text-destructive focus:text-destructive')}
                            onClick={item.onClick}
                        >
                            {item.icon}
                            {item.label}
                        </DropdownMenuItem>
                    </div>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
