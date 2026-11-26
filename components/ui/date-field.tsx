'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type DateFieldProps = Omit<React.ComponentProps<'input'>, 'type' | 'value' | 'onChange'> & {
    value?: string | null;
    onValueChange?: (value: string) => void;
};

/** Date input — replaces Prime Calendar for simple YYYY-MM-DD cases */
export const DateField = React.forwardRef<HTMLInputElement, DateFieldProps>(
    ({ className, value, onValueChange, ...props }, ref) => {
        return (
            <Input
                ref={ref}
                type="date"
                value={value || ''}
                onChange={(e) => onValueChange?.(e.target.value)}
                className={cn(className)}
                {...props}
            />
        );
    }
);
DateField.displayName = 'DateField';
