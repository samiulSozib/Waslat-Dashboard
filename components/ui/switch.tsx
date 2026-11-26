'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export type SwitchProps = {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    className?: string;
    'aria-label'?: string;
};

/** Emerald toggle — replaces Prime InputSwitch */
export function Switch({ checked = false, onCheckedChange, disabled, id, className, ...props }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            id={id}
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange?.(!checked)}
            className={cn(
                'inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 disabled:cursor-not-allowed disabled:opacity-50',
                checked ? 'justify-end bg-emerald-600' : 'justify-start bg-emerald-100',
                className
            )}
            {...props}
        >
            <span className="pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm" />
        </button>
    );
}
