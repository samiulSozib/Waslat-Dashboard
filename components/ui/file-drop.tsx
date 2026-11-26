'use client';

import * as React from 'react';
import { ImagePlus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type FileDropProps = {
    value?: File | null;
    previewUrl?: string | null;
    onChange?: (file: File | null) => void;
    accept?: string;
    disabled?: boolean;
    className?: string;
    hint?: string;
    label?: string;
};

/** Simple image/file dropzone — replaces Prime FileUpload for single assets */
export function FileDrop({
    value,
    previewUrl,
    onChange,
    accept = 'image/*',
    disabled,
    className,
    hint = 'برای انتخاب فایل کلیک کنید یا بکشید و رها کنید',
    label = 'آپلود فایل'
}: FileDropProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [localPreview, setLocalPreview] = React.useState<string | null>(null);
    const [dragging, setDragging] = React.useState(false);

    React.useEffect(() => {
        if (!value) {
            setLocalPreview(null);
            return;
        }
        const url = URL.createObjectURL(value);
        setLocalPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    const shown = localPreview || previewUrl || null;

    const pick = (file: File | null) => {
        onChange?.(file);
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
                }}
                onClick={() => !disabled && inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    if (!disabled) setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (disabled) return;
                    const file = e.dataTransfer.files?.[0] || null;
                    if (file) pick(file);
                }}
                className={cn(
                    'flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-emerald-600 bg-white px-3 py-3 text-center transition-colors hover:border-emerald-700',
                    dragging && 'border-emerald-700 bg-emerald-50',
                    disabled && 'cursor-not-allowed opacity-50'
                )}
            >
                {shown ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={shown} alt="" className="max-h-16 max-w-full rounded-md object-contain" />
                ) : (
                    <>
                        <ImagePlus className="h-5 w-5 text-emerald-700" />
                        <div className="space-y-0.5">
                            <p className="text-xs font-medium text-foreground">{label}</p>
                            <p className="text-[11px] text-muted-foreground">{hint}</p>
                        </div>
                    </>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled}
                onChange={(e) => pick(e.target.files?.[0] || null)}
            />
            {(value || previewUrl) && !disabled ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => {
                        pick(null);
                        if (inputRef.current) inputRef.current.value = '';
                    }}
                >
                    <X className="h-3.5 w-3.5" />
                    حذف فایل
                </Button>
            ) : null}
        </div>
    );
}
