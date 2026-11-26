'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export type PageVariant = 'ops' | 'finance' | 'catalog' | 'network' | 'settings' | 'default';

const RULES: { match: RegExp; variant: PageVariant }[] = [
    { match: /^\/pages\/order/, variant: 'ops' },
    { match: /^\/pages\/(payment|balance|money-transactions|payment-method|payment-type|earning|withdrawal|purchase)/, variant: 'finance' },
    { match: /^\/pages\/(hawala|howala)/, variant: 'finance' },
    { match: /^\/pages\/(companies|company|service|bundle|set-selling|customer-pricing|group)/, variant: 'catalog' },
    { match: /^\/pages\/(reseller|user-list|suppliers|roles)/, variant: 'network' },
    { match: /^\/pages\/(app-settings|general-settings|language|currencies|notification|advertisement|api-keys|backup|translation|help|country|province|district|providers)/, variant: 'settings' }
];

export function resolvePageVariant(pathname: string): PageVariant {
    for (const rule of RULES) {
        if (rule.match.test(pathname)) return rule.variant;
    }
    return 'default';
}

export function PageVariantProvider({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '/';
    const variant = resolvePageVariant(pathname);

    return <div className={cn('waslat-page', `waslat-variant-${variant}`)}>{children}</div>;
}
