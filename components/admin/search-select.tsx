'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Indexable = { [key: string]: any };

export type SearchSelectProps<T extends Indexable = any> = {
    value: T | any;
    options: T[];
    onChange: (value: any) => void;
    optionLabel?: string;
    optionValue?: string;
    placeholder?: string;
    searchPlaceholder?: string;
    className?: string;
    disabled?: boolean;
    error?: boolean;
    showClear?: boolean;
    onSearch?: (searchTerm: string) => void;
    emptyMessage?: string;
    noResultsMessage?: string;
    returnFullObject?: boolean;
    isLoading?: boolean;
    itemTemplate?: (option: T) => React.ReactNode;
    valueTemplate?: (option: T) => React.ReactNode;
    /** Live filter as you type (default). Set false to require Enter / search button. */
    liveSearch?: boolean;
};

function getLabel<T extends Indexable>(option: T, optionLabel: string): string {
    if (!option) return '';
    if (typeof option === 'string' || typeof option === 'number') return String(option);
    if (optionLabel && option[optionLabel] != null) return String(option[optionLabel]);
    return String(option.label ?? option.name ?? option.reseller_name ?? option.method_name ?? option.contact_name ?? '');
}

function getValue<T extends Indexable>(option: T, optionValue: string): any {
    if (!option) return null;
    if (typeof option === 'string' || typeof option === 'number') return option;
    if (optionValue && option[optionValue] != null) return option[optionValue];
    return option.value ?? option.id ?? option;
}

/** Compact searchable select — one control row, clear borders */
export function SearchSelect<T extends Indexable = any>({
    value,
    options = [],
    onChange,
    optionLabel = 'label',
    optionValue = 'value',
    placeholder = 'انتخاب کنید…',
    searchPlaceholder = 'جستجو…',
    className,
    disabled,
    error,
    showClear = true,
    onSearch,
    emptyMessage = 'موردی یافت نشد',
    noResultsMessage = 'عبارت دیگری را امتحان کنید',
    returnFullObject = true,
    isLoading = false,
    itemTemplate,
    valueTemplate,
    liveSearch = true
}: SearchSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const onDoc = (e: MouseEvent) => {
            if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDoc);
        return () => document.removeEventListener('mousedown', onDoc);
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((opt) => getLabel(opt, optionLabel).toLowerCase().includes(q));
    }, [options, query, optionLabel]);

    const selectedLabel = useMemo(() => {
        if (!value) return '';
        if (typeof value === 'object') return getLabel(value, optionLabel);
        const hit = options.find((o) => getValue(o, optionValue) === value);
        return hit ? getLabel(hit, optionLabel) : String(value);
    }, [value, options, optionLabel, optionValue]);

    const runSearch = (term: string) => {
        onSearch?.(term.trim());
        setOpen(true);
    };

    const select = (option: T) => {
        onChange(returnFullObject ? option : getValue(option, optionValue));
        setOpen(false);
        setQuery('');
    };

    const clear = () => {
        onChange(null);
        setQuery('');
        setOpen(false);
        inputRef.current?.focus();
    };

    const showSelected = Boolean(value) && !open && !query;

    return (
        <div ref={rootRef} className={cn('relative w-full', className)}>
            <div className="flex gap-2">
                <div
                    className={cn(
                        'relative flex min-h-10 min-w-0 flex-1 items-center rounded-lg border bg-white shadow-sm transition-colors',
                        error ? 'border-rose-400' : 'border-emerald-600 hover:border-emerald-700',
                        open && !error && 'border-emerald-700 ring-2 ring-emerald-600/25',
                        disabled && 'cursor-not-allowed opacity-50'
                    )}
                >
                    <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    {showSelected ? (
                        <button
                            type="button"
                            disabled={disabled}
                            className="flex min-h-10 w-full items-center gap-2 pe-9 ps-9 text-start"
                            onClick={() => {
                                if (disabled) return;
                                setOpen(true);
                                setTimeout(() => inputRef.current?.focus(), 0);
                            }}
                        >
                            <span className="min-w-0 flex-1 truncate">
                                {typeof value === 'object' && valueTemplate ? (
                                    valueTemplate(value)
                                ) : (
                                    <span className="text-sm font-medium text-foreground">{selectedLabel || placeholder}</span>
                                )}
                            </span>
                        </button>
                    ) : (
                        <Input
                            ref={inputRef}
                            value={query}
                            disabled={disabled}
                            placeholder={value ? selectedLabel || searchPlaceholder : searchPlaceholder || placeholder}
                            className="h-10 border-0 pe-9 ps-9 shadow-none hover:border-0 focus-visible:border-0 focus-visible:ring-0"
                            onFocus={() => setOpen(true)}
                            onChange={(e) => {
                                const next = e.target.value;
                                setQuery(next);
                                setOpen(true);
                                if (liveSearch) onSearch?.(next.trim());
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    runSearch(query);
                                }
                                if (e.key === 'Escape') setOpen(false);
                            }}
                        />
                    )}

                    {value && showClear && !disabled ? (
                        <button
                            type="button"
                            onClick={clear}
                            className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                            aria-label="پاک کردن"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    ) : null}
                </div>

                {!liveSearch ? (
                    <Button
                        type="button"
                        className="h-10 shrink-0 bg-emerald-700 px-3 hover:bg-emerald-800"
                        disabled={disabled || isLoading}
                        onClick={() => runSearch(query)}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        <span className="ms-1.5">جستجو</span>
                    </Button>
                ) : null}
            </div>

            {open && !disabled ? (
                <div className="absolute inset-x-0 z-50 mt-1.5 overflow-hidden rounded-lg border border-emerald-600 bg-white shadow-panel">
                    <div className="flex items-center justify-between border-b border-slate-200 px-3 py-1.5 text-xs text-muted-foreground">
                        <span>{isLoading ? 'در حال جستجو…' : `${filtered.length} نتیجه`}</span>
                        {query ? (
                            <button type="button" className="text-emerald-700 hover:underline" onClick={() => setQuery('')}>
                                پاک کردن متن
                            </button>
                        ) : null}
                    </div>
                    <div className="max-h-52 overflow-y-auto overscroll-contain p-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                لطفاً صبر کنید…
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                                <div>{emptyMessage}</div>
                                <div className="mt-1 text-xs">{noResultsMessage}</div>
                            </div>
                        ) : (
                            filtered.map((option, index) => {
                                const selected =
                                    value &&
                                    (typeof value === 'object'
                                        ? getValue(value, optionValue) === getValue(option, optionValue)
                                        : value === getValue(option, optionValue));
                                return (
                                    <button
                                        key={String(getValue(option, optionValue) ?? index)}
                                        type="button"
                                        className={cn(
                                            'flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-start transition-colors hover:bg-emerald-50',
                                            selected && 'bg-emerald-50'
                                        )}
                                        onClick={() => select(option)}
                                    >
                                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-emerald-700">
                                            {selected ? <Check className="h-4 w-4" /> : null}
                                        </span>
                                        <span className="min-w-0 flex-1">
                                            {itemTemplate ? (
                                                itemTemplate(option)
                                            ) : (
                                                <>
                                                    <div className="text-sm font-medium text-foreground">{getLabel(option, optionLabel)}</div>
                                                    {(option.contact_name || option.phone) && optionLabel !== 'contact_name' ? (
                                                        <div className="mt-0.5 text-xs text-muted-foreground">
                                                            {[option.contact_name, option.phone].filter(Boolean).join(' · ')}
                                                        </div>
                                                    ) : null}
                                                </>
                                            )}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export default SearchSelect;
