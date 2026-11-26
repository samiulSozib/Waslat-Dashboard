'use client';

import { useRef, useState } from 'react';
import axios from 'axios';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Toast } from 'primereact/toast';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/admin/page-header';
import { Button } from '@/components/ui/button';
import withAuth from '../../authGuard';

const GeneralSettingsPage = () => {
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const [loading, setLoading] = useState(false);

    const syncTelegramGroups = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('api_token') || '';
            await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/telegram-chat-ids/fetch`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            toast.current?.show({
                severity: 'success',
                summary: t('SUCCESSFUL', { defaultValue: 'موفق' }),
                detail: t('TELEGRAM_SYNC_SUCCESS', { defaultValue: 'گروه‌های تلگرام با موفقیت همگام شدند.' }),
                life: 4000
            });
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: t('ERROR', { defaultValue: 'خطا' }),
                detail: t('TELEGRAM_SYNC_FAILED', { defaultValue: 'همگام‌سازی گروه‌های تلگرام ناموفق بود.' }),
                life: 5000
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <Toast ref={toast} />
            <PageHeader
                title={t('MENU.APPSETTING', { defaultValue: 'تنظیمات عمومی' })}
                description={t('GENERAL_SETTINGS_DESCRIPTION', {
                    defaultValue: 'ابزارهای عمومی سامانه؛ همگام‌سازی کانال‌ها و گروه‌های تلگرام'
                })}
            />

            <div className="waslat-panel overflow-hidden">
                <div className="flex flex-wrap items-start gap-4 border-b border-border bg-muted/30 p-4 sm:p-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                        <h2 className="text-base font-semibold text-foreground">{t('TELEGRAM_GROUP', { defaultValue: 'گروه تلگرام' })}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('TELEGRAM_GROUP_TEXT', {
                                defaultValue: 'لیست شناسه چت‌های تلگرام را از ربات واکشی و در سامانه به‌روز کنید.'
                            })}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
                    <p className="text-xs text-muted-foreground">
                        {t('TELEGRAM_SYNC_HINT', {
                            defaultValue: 'پس از همگام‌سازی، شناسه‌ها در تنظیمات اعلان‌های تلگرام قابل انتخاب هستند.'
                        })}
                    </p>
                    <Button type="button" size="sm" disabled={loading} onClick={syncTelegramGroups}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        {t('SYNC_TELEGRAM_GROUP', { defaultValue: 'همگام‌سازی گروه‌های تلگرام' })}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default withAuth(GeneralSettingsPage);
