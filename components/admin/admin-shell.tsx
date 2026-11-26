'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AdminSidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_WIDTH } from './admin-sidebar';
import { AdminTopbar } from './admin-topbar';
import { PageVariantProvider } from './page-variant';
import { isRtlLocale, DEFAULT_LOCALE } from '@/lib/locale';
import i18n from 'i18next';

const COLLAPSE_KEY = 'waslat_sidebar_collapsed';

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [ready, setReady] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        try {
            const token = localStorage.getItem('api_token');
            if (!token && pathname !== '/auth/login') {
                router.push('/auth/login');
                return;
            }
            setReady(true);
        } catch {
            router.push('/auth/login');
        }
    }, [pathname, router]);

    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        const syncDir = (lng?: string) => {
            const language = lng || i18n.language || DEFAULT_LOCALE;
            const dir = isRtlLocale(language) ? 'rtl' : 'ltr';
            document.documentElement.lang = language;
            document.documentElement.dir = dir;
            document.body.dir = dir;
        };

        syncDir();
        i18n.on('languageChanged', syncDir);
        return () => {
            i18n.off('languageChanged', syncDir);
        };
    }, []);

    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname]);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
            } catch {
                /* ignore */
            }
            return next;
        });
    };

    if (!ready && pathname !== '/auth/login') {
        return (
            <div className="flex min-h-screen items-center justify-center waslat-grid-bg">
                <div className="waslat-panel px-6 py-4 text-sm text-muted-foreground">در حال بارگذاری...</div>
            </div>
        );
    }

    const desktopOffset = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

    return (
        <div className="flex h-dvh overflow-hidden waslat-grid-bg">
            <AdminSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                collapsed={collapsed}
                onToggleCollapsed={toggleCollapsed}
            />
            <div
                className="flex min-h-0 min-w-0 flex-1 flex-col transition-[padding] duration-300 lg:ps-[var(--waslat-sidebar-w)]"
                style={{ ['--waslat-sidebar-w' as string]: `${desktopOffset}px` }}
            >
                <AdminTopbar onMenuClick={() => setSidebarOpen(true)} onToggleCollapsed={toggleCollapsed} collapsed={collapsed} />
                <main className="min-h-0 flex-1 animate-fade-in overflow-y-auto p-4 md:p-6">
                    <PageVariantProvider>{children}</PageVariantProvider>
                </main>
            </div>
        </div>
    );
}
