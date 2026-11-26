'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type TagInputProps = {
    value?: string[];
    onChange?: (tags: string[]) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    addLabel?: string;
};

/** Chip/tag list — replaces Prime Chips */
export function TagInput({
    value = [],
    onChange,
    placeholder = 'مقدار را وارد کنید…',
    disabled,
    className,
    addLabel = 'افزودن'
}: TagInputProps) {
    const [draft, setDraft] = React.useState('');

    const add = () => {
        const next = draft.trim();
        if (!next) return;
        if (value.includes(next)) {
            setDraft('');
            return;
        }
        onChange?.([...value, next]);
        setDraft('');
    };

    const remove = (tag: string) => {
        onChange?.(value.filter((t) => t !== tag));
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex gap-2">
                <Input
                    value={draft}
                    disabled={disabled}
                    placeholder={placeholder}
                    className="min-w-0 flex-1"
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            add();
                        }
                    }}
                />
                <Button type="button" variant="secondary" disabled={disabled || !draft.trim()} onClick={add}>
                    {addLabel}
                </Button>
            </div>
            {value.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {value.map((tag) => (
                        <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-900 ring-1 ring-emerald-100"
                        >
                            {tag}
                            {!disabled ? (
                                <button
                                    type="button"
                                    onClick={() => remove(tag)}
                                    className="rounded p-0.5 hover:bg-emerald-100"
                                    aria-label="حذف"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            ) : null}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
