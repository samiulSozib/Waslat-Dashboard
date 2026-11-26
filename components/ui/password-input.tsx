'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export type PasswordInputProps = Omit<React.ComponentProps<'input'>, 'type'> & {
    showToggle?: boolean;
};

/** Password with show/hide — replaces Prime Password */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showToggle = true, disabled, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false);

        return (
            <div className="relative w-full">
                <Input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    disabled={disabled}
                    className={cn(showToggle && 'pe-10', className)}
                    autoComplete="new-password"
                    {...props}
                />
                {showToggle ? (
                    <button
                        type="button"
                        tabIndex={-1}
                        disabled={disabled}
                        onClick={() => setVisible((v) => !v)}
                        className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-emerald-50 hover:text-foreground disabled:opacity-50"
                        aria-label={visible ? 'مخفی کردن رمز' : 'نمایش رمز'}
                    >
                        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                ) : null}
            </div>
        );
    }
);
PasswordInput.displayName = 'PasswordInput';
