'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(({ className, ...props }, ref) => {
    return (
        <textarea
            className={cn(
                'flex min-h-[72px] w-full rounded-lg border border-emerald-600 bg-white px-3 py-2 text-sm text-start shadow-sm transition-colors placeholder:text-muted-foreground hover:border-emerald-700 focus-visible:border-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            ref={ref}
            {...props}
        />
    );
});
Textarea.displayName = 'Textarea';

export { Textarea };
