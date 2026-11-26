'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type NumberInputProps = Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
    value?: number | null;
    onValueChange?: (value: number | null) => void;
    min?: number;
    max?: number;
    step?: number;
    allowNull?: boolean;
};

/** Numeric field — replaces Prime InputNumber */
export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
    ({ className, value, onValueChange, min, max, step = 1, allowNull = true, disabled, ...props }, ref) => {
        const display = value === null || value === undefined || Number.isNaN(value) ? '' : String(value);

        return (
            <Input
                ref={ref}
                type="number"
                inputMode="decimal"
                value={display}
                min={min}
                max={max}
                step={step}
                disabled={disabled}
                className={cn('tabular-nums', className)}
                onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '' || raw === '-') {
                        if (allowNull) onValueChange?.(null);
                        return;
                    }
                    const n = Number(raw);
                    if (Number.isNaN(n)) return;
                    let next = n;
                    if (min !== undefined && next < min) next = min;
                    if (max !== undefined && next > max) next = max;
                    onValueChange?.(next);
                }}
                {...props}
            />
        );
    }
);
NumberInput.displayName = 'NumberInput';
