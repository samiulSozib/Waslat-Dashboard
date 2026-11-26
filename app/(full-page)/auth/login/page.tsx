'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { Eye, EyeOff, Languages, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { _login } from '../../../../app/redux/actions/authActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LANGUAGE_OPTIONS, DEFAULT_LOCALE, isRtlLocale } from '@/lib/locale';

const LoginPage = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [checked, setChecked] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useDispatch();
    const router = useRouter();

    const language = i18n.language || DEFAULT_LOCALE;
    const title =
        language === 'en'
            ? process.env.NEXT_PUBLIC_PROJECT_WELCOME_NAME_ENGLISH
            : language === 'ps'
              ? process.env.NEXT_PUBLIC_PROJECT_WELCOME_NAME_PASHTO
              : process.env.NEXT_PUBLIC_PROJECT_WELCOME_NAME_FARSI || 'به وصلت خوش آمدید';

    const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || 'Waslat';
    const logo = process.env.NEXT_PUBLIC_PROJECT_LOGO;

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPassword = localStorage.getItem('rememberedPassword');
        if (savedEmail) {
            setEmail(savedEmail);
            setChecked(true);
        }
        if (savedPassword) {
            setPassword(savedPassword);
            setChecked(true);
        }
    }, []);

    const changeLanguage = (code: string) => {
        i18n.changeLanguage(code).then(() => {
            const dir = isRtlLocale(code) ? 'rtl' : 'ltr';
            document.documentElement.lang = code;
            document.documentElement.dir = dir;
            document.body.dir = dir;
            router.refresh();
        });
    };

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const result = await dispatch<any>(_login(email, password));
            if (result.success) {
                const userInfo = result?.payload?.user_info || JSON.parse(localStorage.getItem('user_info') || '{}');

                if (userInfo.user_type != 1) {
                    localStorage.removeItem('api_token');
                    localStorage.removeItem('user_info');
                    Swal.fire({
                        title: t('login.login_fail'),
                        text: t('login.no_permission'),
                        icon: 'error'
                    });
                    setError(t('login.no_permission'));
                    setLoading(false);
                    return;
                }

                if (checked) {
                    localStorage.setItem('rememberedEmail', email);
                    localStorage.setItem('rememberedPassword', password);
                } else {
                    localStorage.removeItem('rememberedEmail');
                    localStorage.removeItem('rememberedPassword');
                }

                Swal.fire({
                    title: t('login.login_success'),
                    icon: 'success',
                    timer: 1200,
                    showConfirmButton: false
                });

                router.push('/');
            } else {
                Swal.fire({
                    title: t('login.login_fail'),
                    icon: 'error'
                });
                setError(result.error || t('login.login_fail'));
            }
        } catch {
            Swal.fire({
                title: t('login.login_fail'),
                icon: 'error'
            });
            setError(t('login.unexpected_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen overflow-hidden waslat-grid-bg">
            {/* Ambient green glow */}
            <div className="pointer-events-none absolute -start-24 top-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -end-16 bottom-0 h-80 w-80 rounded-full bg-teal-500/15 blur-3xl" />

            <div className="absolute end-4 top-4 z-20 sm:end-6 sm:top-6">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 bg-card/80 backdrop-blur">
                            <Languages className="h-4 w-4" />
                            زبان
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
            </div>

            <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-8 px-4 py-10 lg:grid-cols-2 lg:gap-12 lg:px-8">
                {/* Brand panel — desktop */}
                <div className="hidden animate-fade-in text-start lg:block">
                    <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-200/70 bg-white/70 px-4 py-3 shadow-panel backdrop-blur">
                        {logo ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logo} alt={projectName} className="h-10 w-auto object-contain" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-sm font-bold text-white">W</div>
                        )}
                        <div>
                            <div className="text-sm font-semibold text-foreground">{projectName}</div>
                            <div className="text-xs text-muted-foreground">پنل مدیریت</div>
                        </div>
                    </div>

                    <h1 className="mt-8 max-w-lg text-3xl font-semibold leading-relaxed tracking-tight text-foreground xl:text-4xl">
                        مدیریت سریع عملیات، مالی و نمایندگان
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-7 text-muted-foreground">
                        ورود امن به داشبورد وصلات. طراحی فارسی‌محور با پشتیبانی کامل راست‌به‌چپ.
                    </p>

                    <div className="mt-8 grid max-w-md grid-cols-2 gap-3">
                        <div className="waslat-panel p-4">
                            <div className="text-2xl font-semibold text-emerald-700">RTL</div>
                            <div className="mt-1 text-xs text-muted-foreground">راست‌چین کامل</div>
                        </div>
                        <div className="waslat-panel p-4">
                            <div className="text-2xl font-semibold text-emerald-700">FA</div>
                            <div className="mt-1 text-xs text-muted-foreground">فارسی پیش‌فرض</div>
                        </div>
                    </div>
                </div>

                {/* Login card */}
                <div className="mx-auto w-full max-w-md animate-fade-in lg:ms-auto lg:me-0">
                    <div className="waslat-panel overflow-hidden border-emerald-100/80 p-6 sm:p-8">
                        <div className="mb-7 text-center md:text-start">
                            <div className="mb-4 flex justify-center md:hidden">
                                {logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={logo} alt={projectName} className="h-12 w-auto object-contain" />
                                ) : null}
                            </div>
                            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
                            <p className="mt-2 text-sm text-muted-foreground">{t('login.signin_continue', { defaultValue: 'برای ادامه وارد شوید' })}</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleLogin}>
                            {error ? (
                                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 text-start">{error}</div>
                            ) : null}

                            <div className="space-y-2 text-start">
                                <label htmlFor="email" className="text-sm font-medium text-foreground">
                                    {t('login.email_label', { defaultValue: 'ایمیل' })}
                                </label>
                                <Input
                                    id="email"
                                    type="text"
                                    autoComplete="username"
                                    placeholder={t('login.email_placeholder', { defaultValue: 'آدرس ایمیل' })}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2 text-start">
                                <label htmlFor="password" className="text-sm font-medium text-foreground">
                                    {t('login.password_label', { defaultValue: 'رمز عبور' })}
                                </label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder={t('login.password_placeholder', { defaultValue: 'رمز عبور' })}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pe-11"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute end-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-emerald-50 hover:text-foreground"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                                <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={(e) => setChecked(e.target.checked)}
                                        className="h-4 w-4 rounded border-emerald-300 accent-emerald-700"
                                    />
                                    <span>{t('login.remember_me', { defaultValue: 'مرا به خاطر بسپار' })}</span>
                                </label>
                                <span className="text-sm font-medium text-emerald-700">
                                    {t('login.forgot_password', { defaultValue: 'رمز عبور را فراموش کرده‌اید؟' })}
                                </span>
                            </div>

                            <Button type="submit" className="mt-2 h-11 w-full text-base" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t('login.signing_in', { defaultValue: 'در حال ورود...' })}
                                    </>
                                ) : (
                                    t('login.sign_in', { defaultValue: 'ورود' })
                                )}
                            </Button>
                        </form>
                    </div>

                    <p className="mt-4 text-center text-xs text-muted-foreground">
                        {projectName} · پنل مدیریت
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
