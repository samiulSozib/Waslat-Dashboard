'use client';

import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

type FormSheetProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    /** wide = ops forms, xl = reseller/company */
    size?: 'md' | 'lg' | 'xl' | 'full';
    side?: 'left' | 'right';
};

const sizeClass: Record<NonNullable<FormSheetProps['size']>, string> = {
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-3xl',
    full: 'sm:max-w-5xl'
};

/** Full-height create/edit panel — Persian/RTL friendly */
export function FormSheet({ open, onOpenChange, title, description, children, footer, size = 'lg', side = 'left' }: FormSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side={side} className={cn('flex w-full flex-col gap-0 overflow-hidden p-0', sizeClass[size])}>
                <SheetHeader className="shrink-0 border-b border-slate-200 bg-gradient-to-l from-emerald-50 to-white px-5 py-3 text-start">
                    <div className="flex items-start justify-between gap-3 pe-8">
                        <div className="min-w-0 space-y-0.5">
                            <SheetTitle className="text-base font-semibold text-emerald-950">{title}</SheetTitle>
                            {description ? <SheetDescription className="text-xs text-muted-foreground">{description}</SheetDescription> : null}
                        </div>
                    </div>
                </SheetHeader>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">{children}</div>

                {footer ? (
                    <div className="shrink-0 border-t border-slate-200 bg-emerald-50/40 px-5 py-2.5">
                        <div className="flex flex-wrap items-center justify-end gap-2">{footer}</div>
                    </div>
                ) : null}
            </SheetContent>
        </Sheet>
    );
}

type FormSectionProps = {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
};

/** Flat field grid — title/description kept for API compat but not rendered (less scroll) */
export function FormSection({ title: _title, description: _description, children, className }: FormSectionProps) {
    return <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', className)}>{children}</div>;
}

type FormFieldProps = {
    label: string;
    required?: boolean;
    error?: string | false | null;
    hint?: string;
    className?: string;
    fullWidth?: boolean;
    children: React.ReactNode;
};

export function FormField({ label, required, error, hint, className, fullWidth, children }: FormFieldProps) {
    return (
        <div className={cn('space-y-1 text-start', fullWidth && 'sm:col-span-2', className)}>
            <label className="block text-xs font-medium text-foreground">
                {label}
                {required ? <span className="ms-1 text-rose-600">*</span> : null}
            </label>
            {children}
            {hint && !error ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
            {error ? <p className="text-[11px] font-medium text-rose-600">{error}</p> : null}
        </div>
    );
}

type FormActionsProps = {
    onCancel: () => void;
    onSubmit: () => void;
    submitLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    submitDisabled?: boolean;
};

export function FormActions({
    onCancel,
    onSubmit,
    submitLabel,
    cancelLabel,
    loading,
    submitDisabled
}: FormActionsProps) {
    const { t } = useTranslation();
    return (
        <>
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                {cancelLabel || t('APP.GENERAL.CANCEL', { defaultValue: 'انصراف' })}
            </Button>
            <Button type="button" onClick={onSubmit} disabled={loading || submitDisabled}>
                {loading ? t('SAVING', { defaultValue: 'در حال ذخیره...' }) : submitLabel || t('FORM.GENERAL.SUBMIT', { defaultValue: 'ذخیره' })}
            </Button>
        </>
    );
}

/** Compact confirm dialog chrome for delete/status */
export function ConfirmActions({
    onCancel,
    onConfirm,
    confirmLabel = 'تأیید',
    cancelLabel = 'انصراف',
    danger
}: {
    onCancel: () => void;
    onConfirm: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
}) {
    return (
        <>
            <Button type="button" variant="outline" onClick={onCancel}>
                {cancelLabel}
            </Button>
            <Button type="button" variant={danger ? 'destructive' : 'default'} onClick={onConfirm}>
                {confirmLabel}
            </Button>
        </>
    );
}

export function FormCloseButton({ onClick }: { onClick: () => void }) {
    return (
        <button type="button" onClick={onClick} className="rounded-lg p-2 text-muted-foreground hover:bg-emerald-50 hover:text-foreground" aria-label="بستن">
            <X className="h-4 w-4" />
        </button>
    );
}
