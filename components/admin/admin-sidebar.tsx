'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { NAV_SECTIONS, type NavItem } from './nav-config';

/** Keep widths free of PrimeFlex `.w-4` / `.w-8` (those mean % columns). */
export const SIDEBAR_WIDTH = 220;
export const SIDEBAR_COLLAPSED_WIDTH = 64;

const iconCls = 'waslat-nav-icon shrink-0 opacity-90';

type AdminSidebarProps = {
    open: boolean;
    onClose: () => void;
    collapsed: boolean;
    onToggleCollapsed: () => void;
};

function NavLink({
    item,
    onNavigate,
    depth = 0,
    collapsed
}: {
    item: NavItem;
    onNavigate?: () => void;
    depth?: number;
    collapsed?: boolean;
}) {
    const pathname = usePathname();
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const Icon = item.icon;
    const hasChildren = !!item.children?.length;
    const hrefPath = item.href?.split('?')[0] || '';
    const active = hrefPath === '/' ? pathname === '/' : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
    const label = t(item.labelKey, { defaultValue: item.labelKey });

    useEffect(() => {
        if (item.children?.some((c) => c.href && pathname.startsWith(c.href.split('?')[0]))) {
            setOpen(true);
        }
    }, [pathname, item.children]);

    if (hasChildren) {
        if (collapsed) {
            const first = item.children![0];
            const FirstIcon = first.icon || Icon;
            const childActive = item.children!.some((c) => {
                const h = c.href?.split('?')[0] || '';
                return h && (pathname === h || pathname.startsWith(`${h}/`));
            });
            return (
                <Link
                    href={first.href || '#'}
                    onClick={onNavigate}
                    title={label}
                    className={cn(
                        'waslat-nav-hit flex items-center justify-center rounded-md transition-colors',
                        childActive ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-sidebar-foreground'
                    )}
                >
                    <FirstIcon className={iconCls} />
                </Link>
            );
        }

        return (
            <div className="space-y-0.5">
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className={cn(
                        'flex w-full items-center gap-2 rounded-md px-1 py-1.5 text-[13px] transition-colors',
                        'text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-sidebar-foreground',
                        depth > 0 && 'ps-3'
                    )}
                >
                    <Icon className={iconCls} />
                    <span className="min-w-0 flex-1 truncate text-start leading-tight">{label}</span>
                    <ChevronDown className={cn(iconCls, 'opacity-60 transition-transform', open && 'rotate-180')} />
                </button>
                {open && (
                    <div className="ms-2.5 space-y-0.5 border-s border-sidebar-border/50 ps-1.5">
                        {item.children!.map((child) => (
                            <NavLink key={child.labelKey + (child.href || '')} item={child} onNavigate={onNavigate} depth={depth + 1} collapsed={collapsed} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    if (collapsed) {
        return (
            <Link
                href={item.href || '#'}
                onClick={onNavigate}
                title={label}
                className={cn(
                    'waslat-nav-hit flex items-center justify-center rounded-md transition-colors',
                    active ? 'bg-sidebar-accent text-white shadow-sm' : 'text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-sidebar-foreground'
                )}
            >
                <Icon className={iconCls} />
            </Link>
        );
    }

    return (
        <Link
            href={item.href || '#'}
            onClick={onNavigate}
            title={label}
            className={cn(
                'flex w-full items-center justify-start gap-2 rounded-md px-1 py-1.5 text-[13px] transition-colors',
                active
                    ? 'bg-sidebar-accent text-white shadow-sm'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-muted hover:text-sidebar-foreground',
                depth > 0 && 'ps-1'
            )}
        >
            <Icon className={iconCls} />
            <span className="min-w-0 truncate text-start leading-tight">{label}</span>
        </Link>
    );
}

export function AdminSidebar({ open, onClose, collapsed, onToggleCollapsed }: AdminSidebarProps) {
    const { t } = useTranslation();
    const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'Waslat';
    const logo = process.env.NEXT_PUBLIC_PROJECT_LOGO;

    return (
        <>
            <div
                className={cn('fixed inset-0 z-40 bg-black/40 backdrop-blur-[1px] lg:hidden', open ? 'block' : 'hidden')}
                onClick={onClose}
                aria-hidden
            />

            <aside
                className={cn(
                    'waslat-sidebar fixed inset-y-0 start-0 z-50 flex h-dvh flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-300',
                    collapsed && 'is-collapsed',
                    open ? 'translate-x-0' : 'max-lg:-translate-x-full max-lg:rtl:translate-x-full lg:translate-x-0'
                )}
                style={{
                    width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                    maxWidth: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
                    minWidth: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH
                }}
                data-collapsed={collapsed ? 'true' : 'false'}
            >
                <div
                    className={cn(
                        'flex h-14 shrink-0 items-center border-b border-sidebar-border',
                        collapsed ? 'flex-col justify-center gap-1 px-1 py-2' : 'gap-1 px-1.5'
                    )}
                >
                    <Link
                        href="/"
                        className={cn('flex min-w-0 items-center gap-1.5', collapsed ? 'justify-center' : 'flex-1')}
                        onClick={onClose}
                    >
                        {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt={projectName} className="waslat-nav-logo rounded-md object-contain" />
                        ) : (
                            <div className="waslat-nav-logo flex items-center justify-center rounded-md bg-sidebar-accent text-[11px] font-bold text-white">W</div>
                        )}
                        {!collapsed && (
                            <div className="min-w-0 text-start">
                                <div className="truncate text-sm font-semibold leading-tight">{projectName}</div>
                                <div className="truncate text-[10px] text-sidebar-foreground/55">پنل مدیریت</div>
                            </div>
                        )}
                    </Link>

                    <button type="button" className="rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-muted lg:hidden" onClick={onClose} aria-label="بستن">
                        <X className={iconCls} />
                    </button>

                    <button
                        type="button"
                        className="hidden rounded-md p-1 text-sidebar-foreground/70 hover:bg-sidebar-muted lg:inline-flex"
                        onClick={onToggleCollapsed}
                        title={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
                        aria-label={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
                    >
                        {collapsed ? <PanelLeftOpen className={iconCls} /> : <PanelLeftClose className={iconCls} />}
                    </button>
                </div>

                <nav
                    className={cn(
                        'min-h-0 flex-1 overflow-y-auto overscroll-contain py-1.5',
                        collapsed ? 'flex flex-col items-center gap-0.5 px-1' : 'space-y-2 px-1'
                    )}
                >
                    {NAV_SECTIONS.map((section, idx) => (
                        <div key={idx} className={cn(collapsed ? 'flex flex-col items-center gap-0.5' : 'space-y-0.5')}>
                            {section.titleKey && !collapsed && (
                                <div className="px-1 pb-0.5 pt-0.5 text-[10px] font-semibold tracking-wide text-sidebar-foreground/40">
                                    {t(section.titleKey)}
                                </div>
                            )}
                            {collapsed && idx > 0 ? <div className="waslat-nav-divider my-0.5 bg-sidebar-border/80" /> : null}
                            {section.items.map((item) => (
                                <NavLink key={item.labelKey + (item.href || '')} item={item} onNavigate={onClose} collapsed={collapsed} />
                            ))}
                        </div>
                    ))}
                </nav>

                <div className={cn('border-t border-sidebar-border', collapsed ? 'p-1' : 'px-2 py-1.5')}>
                    <button
                        type="button"
                        className={cn(
                            'hidden w-full items-center rounded-md text-sidebar-foreground/70 transition-colors hover:bg-sidebar-muted hover:text-sidebar-foreground lg:flex',
                            collapsed ? 'waslat-nav-hit justify-center' : 'gap-1.5 px-1.5 py-1.5 text-[12px]'
                        )}
                        onClick={onToggleCollapsed}
                        title={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
                        aria-label={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
                    >
                        {collapsed ? <PanelLeftOpen className={iconCls} /> : <PanelLeftClose className={iconCls} />}
                        {!collapsed && <span className="truncate">{collapsed ? 'باز کردن' : 'جمع کردن منو'}</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
