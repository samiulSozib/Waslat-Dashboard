'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { LogOut, Menu, Languages, PanelLeftClose, PanelLeftOpen, UserRound } from 'lucide-react';
import Swal from 'sweetalert2';
import { AppDispatch } from '@/app/redux/store';
import { signOut } from '@/app/redux/actions/authActions';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LANGUAGE_OPTIONS } from '@/lib/locale';
import { getUserInfo } from '@/lib/utils';
import { NAV_SECTIONS } from './nav-config';

type AdminTopbarProps = {
    onMenuClick: () => void;
    onToggleCollapsed?: () => void;
    collapsed?: boolean;
};

function findNavLabel(pathname: string): string | null {
    const clean = pathname.split('?')[0];
    for (const section of NAV_SECTIONS) {
        for (const item of section.items) {
            if (!item.href) continue;
            const href = item.href.split('?')[0];
            if (href === '/' && clean === '/') return item.labelKey;
            if (href !== '/' && (clean === href || clean.startsWith(`${href}/`))) return item.labelKey;
            if (item.children) {
                for (const child of item.children) {
                    if (!child.href) continue;
                    const ch = child.href.split('?')[0];
                    if (clean === ch || clean.startsWith(`${ch}/`)) return child.labelKey;
                }
            }
        }
    }
    return null;
}

export function AdminTopbar({ onMenuClick, onToggleCollapsed, collapsed }: AdminTopbarProps) {
    const { t } = useTranslation();
    const router = useRouter();
    const pathname = usePathname() || '/';
    const dispatch = useDispatch<AppDispatch>();
    const [userName, setUserName] = useState('کاربر');

    const titleKey = useMemo(() => findNavLabel(pathname), [pathname]);
    const title = titleKey ? t(titleKey, { defaultValue: titleKey }) : t('MENU.DASHBOARD');
    const subtitle =
        pathname.startsWith('/pages/reseller')
            ? 'مدیریت نمایندگان و زیر‌فروشان'
            : pathname.startsWith('/pages/order')
              ? 'پیگیری و مدیریت سفارش‌ها'
              : pathname.startsWith('/pages/payment') || pathname.startsWith('/pages/balance')
                ? 'عملیات مالی و موجودی'
                : 'مدیریت سریع عملیات و مالی';

    const currentLanguageName = useMemo(() => {
        const code = (i18n.language || 'fa').toLowerCase().split('-')[0];
        return LANGUAGE_OPTIONS.find((lang) => lang.language_code === code)?.name || 'زبان';
    }, [i18n.language, t]);

    useEffect(() => {
        const info = getUserInfo<{ name?: string; username?: string }>();
        setUserName(info.name || info.username || 'کاربر');
    }, []);

    const logout = () => {
        dispatch(signOut());
        Swal.fire({
            title: t('LOGOUT_SUCCESS'),
            icon: 'success'
        });
        router.push('/auth/login');
    };

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code).then(() => {
            document.documentElement.lang = code;
            document.documentElement.dir = ['fa', 'ar', 'ps', 'bn'].includes(code) ? 'rtl' : 'ltr';
            document.body.dir = document.documentElement.dir;
            router.refresh();
        });
    };

    return (
        <header className="z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/80 bg-card/90 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-card/75 sm:gap-3 sm:px-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick} aria-label="منو">
                <Menu className="h-5 w-5" />
            </Button>
            {onToggleCollapsed ? (
                <Button
                    variant="ghost"
                    size="icon"
                    className="hidden lg:inline-flex"
                    onClick={onToggleCollapsed}
                    aria-label={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
                    title={collapsed ? 'باز کردن منو' : 'جمع کردن منو'}
                >
                    {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </Button>
            ) : null}

            <div className="min-w-0 flex-1 text-start">
                <div className="truncate text-sm font-semibold text-foreground">{title}</div>
                <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-2">
                        <Languages className="h-4 w-4" />
                        <span className="hidden sm:inline">{currentLanguageName}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                    <DropdownMenuLabel>انتخاب زبان</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {LANGUAGE_OPTIONS.map((lang) => (
                        <DropdownMenuItem key={lang.language_code} onClick={() => changeLanguage(lang.language_code)} className="gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={lang.flag} alt="" className="h-4 w-5 rounded-sm object-cover" />
                            <span>{lang.name}</span>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="gap-2">
                        <UserRound className="h-4 w-4" />
                        <span className="hidden max-w-[8rem] truncate sm:inline">{userName}</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
                    <DropdownMenuLabel className="truncate">{userName}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
                        <LogOut className="h-4 w-4" />
                        {t('LOGOUT', { defaultValue: 'خروج' })}
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
