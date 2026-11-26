'use client';

import { _changeResellerPassword, _changeResellerPin, _changeResellerStatus, _getResellerById } from '@/app/redux/actions/resellerActions';
import { AppDispatch } from '@/app/redux/store';
import ResellerBalances from '@/app/(main)/components/ResellerBalances';
import ResellerOrders from '@/app/(main)/components/ResellerOrders';
import ResellerPayments from '@/app/(main)/components/ResellerPayment';
import ResellerSubResellers from '@/app/(main)/components/ResellerSubResellers';
import ResellerTransactions from '@/app/(main)/components/ResellerTransaction';
import { ConfirmActions, FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { ResellerAttachSheet, ResellerHawalaList, ResellerMoneySheets, ResellerParentSheet, ResellerSettingsPanel, MoneyKind } from './desk';
import { StatCard } from '@/components/admin/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { cn } from '@/lib/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import { Coins, KeyRound, List, Mail, MapPin, Phone, Receipt, ShoppingBag, TrendingUp, User, Wallet } from 'lucide-react';
import { Toast } from 'primereact/toast';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';

interface ResellerDetailsPageProps {
    params: { id: string };
}

type ResellerTab = 'documents' | 'settings' | 'subs' | 'transactions' | 'orders' | 'balances' | 'payments' | 'hawala';

type PasswordForm = {
    new_password: string;
    confirm_new_password: string;
};

type PinForm = {
    new_pin: string;
    confirm_new_pin: string;
};

function formatAmount(value: unknown) {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) return value == null || value === '' ? '0' : String(value);
    return amount.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

const ResellerDetailsPage = ({ params }: ResellerDetailsPageProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { singleReseller } = useSelector((state: any) => state.resellerReducer);
    const userInfo = JSON.parse(typeof window === 'undefined' ? '{}' : localStorage.getItem('user_info') || '{}');
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);
    const [tab, setTab] = useState<ResellerTab>('documents');
    const [statusOpen, setStatusOpen] = useState(false);
    const [statusBusy, setStatusBusy] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [showPinDialog, setShowPinDialog] = useState(false);
    const [money, setMoney] = useState<MoneyKind | null>(null);
    const [parentOpen, setParentOpen] = useState(false);
    const [attachOpen, setAttachOpen] = useState(false);
    const [lists, setLists] = useState({ payments: 0, balances: 0, hawala: 0, subs: 0 });

    const passwordSchema = Yup.object({
        new_password: Yup.string().min(8, t('validation.new_password.min')).required(t('validation.new_password.required')),
        confirm_new_password: Yup.string()
            .oneOf([Yup.ref('new_password'), ''], t('validation.confirm_new_password.oneOf'))
            .required(t('validation.confirm_new_password.required'))
    });

    const pinSchema = Yup.object({
        new_pin: Yup.string().length(4, t('validation.new_pin.length')).required(t('validation.new_pin.required')),
        confirm_new_pin: Yup.string()
            .oneOf([Yup.ref('new_pin'), ''], t('validation.confirm_new_pin.oneOf'))
            .required(t('validation.confirm_new_pin.required'))
    });

    const passwordForm = useForm<PasswordForm>({
        resolver: yupResolver(passwordSchema),
        defaultValues: { new_password: '', confirm_new_password: '' }
    });

    const pinForm = useForm<PinForm>({
        resolver: yupResolver(pinSchema),
        defaultValues: { new_pin: '', confirm_new_pin: '' }
    });

    useEffect(() => {
        if (params.id) {
            dispatch(_getResellerById(Number(params.id)));
        }
    }, [params.id, dispatch]);

    const handlePasswordChange = passwordForm.handleSubmit((values) => {
        dispatch(
            _changeResellerPassword(
                {
                    admin_password: singleReseller?.account_password,
                    new_password: values.new_password,
                    confirm_new_password: values.confirm_new_password,
                    reseller_id: params.id
                },
                toast,
                t
            )
        );
        setShowPasswordDialog(false);
        passwordForm.reset();
    });

    const handlePinChange = pinForm.handleSubmit((values) => {
        dispatch(
            _changeResellerPin(
                {
                    new_pin: values.new_pin,
                    confirm_new_pin: values.confirm_new_pin,
                    reseller_id: params.id
                },
                toast,
                t
            )
        );
        setShowPinDialog(false);
        pinForm.reset();
    });

    if (!singleReseller) {
        return <div className="waslat-panel px-4 py-10 text-center text-sm text-muted-foreground">{t('RESELLER.PROFILE.LOADING', { defaultValue: 'در حال بارگذاری فروشنده...' })}</div>;
    }

    const currencyLabel = userInfo?.currency?.symbol || singleReseller.currency?.symbol || singleReseller.currency?.code || '';
    const active = Number(singleReseller.status) === 1;
    const place = [singleReseller.districts?.district_name, singleReseller.province?.province_name, singleReseller.country?.country_name].filter(Boolean).join('، ');

    const confirmStatus = async () => {
        if (statusBusy) return;
        setStatusBusy(true);
        const ok = await dispatch(_changeResellerStatus(Number(singleReseller.id), Number(singleReseller.status), toast, t));
        setStatusBusy(false);
        if (ok) setStatusOpen(false);
    };

    const tabs: { id: ResellerTab; label: string }[] = [
        { id: 'documents', label: t('DOCUMENTS', { defaultValue: 'اسناد' }) },
        { id: 'orders', label: t('ORDERS', { defaultValue: 'سفارش‌ها' }) },
        { id: 'balances', label: t('BALANCES', { defaultValue: 'موجودی‌ها' }) },
        { id: 'payments', label: t('PAYMENTS', { defaultValue: 'پرداخت‌ها' }) },
        { id: 'transactions', label: t('TRANSACTIONS', { defaultValue: 'تراکنش‌ها' }) },
        { id: 'subs', label: t('SUB_RESELLERS', { defaultValue: 'زیرفروشندگان' }) },
        { id: 'hawala', label: t('MENU.HAWALAS', { defaultValue: 'حواله‌ها' }) },
        { id: 'settings', label: t('SETTINGS', { defaultValue: 'تنظیمات' }) }
    ];

    return (
        <div className="space-y-4">
            <Toast ref={toast} />

            <section className="waslat-panel flex flex-col gap-4 p-4 lg:flex-row lg:items-center">
                <img
                    src={singleReseller.profile_image_url || '/demo/images/avatar/user.png'}
                    alt={singleReseller.reseller_name || ''}
                    className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-emerald-100"
                />
                <div className="min-w-0 flex-1 space-y-2 text-start">
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-lg font-semibold text-foreground">{singleReseller.reseller_name}</h1>
                        <Badge variant={active ? 'success' : 'danger'}>{active ? t('ACTIVE', { defaultValue: 'فعال' }) : t('INACTIVE', { defaultValue: 'غیرفعال' })}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        {singleReseller.contact_name ? (
                            <span className="inline-flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {singleReseller.contact_name}
                            </span>
                        ) : null}
                        {singleReseller.phone ? (
                            <span className="inline-flex items-center gap-1">
                                <Phone className="h-3.5 w-3.5" />
                                <span dir="ltr" className="tabular-nums">{singleReseller.phone}</span>
                            </span>
                        ) : null}
                        {place ? (
                            <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {place}
                            </span>
                        ) : null}
                        {singleReseller.email ? (
                            <span className="inline-flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                <span dir="ltr">{singleReseller.email}</span>
                            </span>
                        ) : null}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={() => setShowPasswordDialog(true)}>
                        <KeyRound className="h-4 w-4" />
                        {t('RESELLER.PASSWORDSETTING.CHANGEPASSWORD', { defaultValue: 'تغییر رمز' })}
                    </Button>
                    <Button type="button" size="sm" variant="secondary" onClick={() => setShowPinDialog(true)}>
                        {t('RESELLER.PINSETTING.CHANGEPIN', { defaultValue: 'تغییر پین' })}
                    </Button>
                    <Button type="button" size="sm" onClick={() => setMoney('payment')}>
                        {t('RESELLER.PROFILE.ADD_PAYMENT', { defaultValue: 'ثبت پرداخت' })}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setMoney('balance')}>
                        {t('RESELLER.PROFILE.ADD_BALANCE', { defaultValue: 'ثبت موجودی' })}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setMoney('hawala')}>
                        {t('RESELLER.PROFILE.ADD_HAWALA', { defaultValue: 'ثبت حواله' })}
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => setParentOpen(true)}>
                        {t('RESELLER.PROFILE.CHANGE_PARENT', { defaultValue: 'تغییر والد' })}
                    </Button>
                    <Button type="button" size="sm" variant={active ? 'destructive' : 'default'} onClick={() => setStatusOpen(true)}>
                        {active ? t('RESELLER.PROFILE.DEACTIVATE', { defaultValue: 'غیرفعال کردن' }) : t('RESELLER.PROFILE.ACTIVATE', { defaultValue: 'فعال کردن' })}
                    </Button>
                </div>
            </section>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label={t('RESELLER.VIEW.BALANCE', { defaultValue: 'موجودی' })} value={`${formatAmount(singleReseller.balance)} ${currencyLabel}`.trim()} icon={Wallet} tone="primary" onClick={() => setTab('balances')} />
                <StatCard label={t('RESELLER.VIEW.TODAYORDER', { defaultValue: 'سفارشات امروز' })} value={formatAmount(singleReseller.today_orders)} icon={ShoppingBag} tone="sky" onClick={() => setTab('orders')} />
                <StatCard label={t('RESELLER.VIEW.TOTALORDER', { defaultValue: 'مجموع سفارشات' })} value={formatAmount(singleReseller.total_orders)} icon={List} tone="slate" onClick={() => setTab('orders')} />
                <StatCard label={t('RESELLER.VIEW.TODAYSALE', { defaultValue: 'فروش امروز' })} value={formatAmount(singleReseller.today_sale)} icon={Receipt} tone="amber" />
                <StatCard label={t('RESELLER.VIEW.TOTALSALE', { defaultValue: 'مجموع فروش' })} value={formatAmount(singleReseller.total_sale)} icon={Receipt} tone="slate" />
                <StatCard label={t('RESELLER.VIEW.TODAYPROFIT', { defaultValue: 'سود امروز' })} value={formatAmount(singleReseller.today_profit)} icon={TrendingUp} tone="primary" />
                <StatCard label={t('RESELLER.VIEW.TOTALPROFIT', { defaultValue: 'مجموع سود' })} value={formatAmount(singleReseller.total_profit)} icon={Coins} tone="amber" />
            </div>

            <div className="space-y-3">
                <div className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-white p-1">
                    {tabs.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setTab(item.id)}
                            className={cn('shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium', tab === item.id ? 'bg-emerald-700 text-white' : 'text-muted-foreground hover:bg-emerald-50')}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {tab === 'documents' ? (
                    <section className="grid gap-3 md:grid-cols-2">
                        {[
                            { src: singleReseller.reseller_identity_attachment, label: t('IDENTITY_DOCUMENT', { defaultValue: 'مدرک شناسایی' }) },
                            { src: singleReseller.extra_optional_proof, label: t('EXTRA_DOCUMENT', { defaultValue: 'مدرک تکمیلی' }) }
                        ].map((doc) => (
                            <div key={doc.label} className="waslat-panel space-y-2 p-3">
                                <div className="text-xs font-medium">{doc.label}</div>
                                {typeof doc.src === 'string' && doc.src ? (
                                    <img src={doc.src} alt={doc.label} className="h-64 w-full rounded-lg object-contain bg-muted/30" />
                                ) : (
                                    <div className="flex h-40 items-center justify-center rounded-lg bg-muted/30 text-xs text-muted-foreground">{t('RESELLER.PROFILE.NO_DOCUMENT', { defaultValue: 'مدرکی ثبت نشده' })}</div>
                                )}
                            </div>
                        ))}
                    </section>
                ) : null}

                {tab === 'settings' ? (
                    <div className="space-y-3">
                        <ResellerSettingsPanel reseller={singleReseller} toast={toast} />
                    <section className="grid gap-3 md:grid-cols-2">
                        <div className="waslat-panel flex items-center justify-between gap-3 p-4">
                            <div className="text-start">
                                <div className="text-sm font-semibold">{t('RESELLER.PASSWORDSETTING.CHANGEPASSWORD', { defaultValue: 'تغییر رمز' })}</div>
                                <p className="mt-1 text-xs text-muted-foreground">{t('RESELLER.PASSWORDSETTING.YOUCANCHANGE', { defaultValue: 'رمز ورود این فروشنده را عوض کنید' })}</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowPasswordDialog(true)}>
                                {t('RESELLER.PASSWORDSETTING.CHANGEPASSWORD', { defaultValue: 'تغییر رمز' })}
                            </Button>
                        </div>
                        <div className="waslat-panel flex items-center justify-between gap-3 p-4">
                            <div className="text-start">
                                <div className="text-sm font-semibold">{t('RESELLER.PINSETTING.CHANGEPIN', { defaultValue: 'تغییر پین' })}</div>
                                <p className="mt-1 text-xs text-muted-foreground">{t('RESELLER.PINSETTING.YOUCANCHANGE', { defaultValue: 'پین چهار رقمی فروشنده را عوض کنید' })}</p>
                            </div>
                            <Button type="button" size="sm" variant="outline" onClick={() => setShowPinDialog(true)}>
                                {t('RESELLER.PINSETTING.CHANGEPIN', { defaultValue: 'تغییر پین' })}
                            </Button>
                        </div>
                    </section>
                    </div>
                ) : null}

                {tab === 'subs' ? (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <Button type="button" size="sm" variant="outline" onClick={() => setAttachOpen(true)}>
                                {t('RESELLER.PROFILE.ATTACH_EXISTING', { defaultValue: 'آوردن فروشنده موجود' })}
                            </Button>
                        </div>
                        <ResellerSubResellers key={lists.subs} resellerId={Number(params.id)} />
                    </div>
                ) : null}
                {tab === 'hawala' ? <ResellerHawalaList resellerId={Number(params.id)} refreshKey={lists.hawala} /> : null}
                {tab === 'transactions' ? <ResellerTransactions resellerId={Number(params.id)} /> : null}
                {tab === 'orders' ? <ResellerOrders resellerId={Number(params.id)} /> : null}
                {tab === 'balances' ? <ResellerBalances key={lists.balances} resellerId={Number(params.id)} /> : null}
                {tab === 'payments' ? <ResellerPayments key={lists.payments} resellerId={Number(params.id)} /> : null}
            </div>

            <FormSheet
                open={showPasswordDialog}
                onOpenChange={setShowPasswordDialog}
                title={t('RESELLER.PASSWORDSETTING.CHANGEPASSWORD', { defaultValue: 'تغییر رمز' })}
                description={singleReseller.reseller_name}
                size="md"
                side="left"
                footer={<FormActions onCancel={() => setShowPasswordDialog(false)} onSubmit={handlePasswordChange} cancelLabel={t('APP.GENERAL.CANCEL', { defaultValue: 'انصراف' })} submitLabel={t('FORM.GENERAL.SUBMIT', { defaultValue: 'ذخیره' })} />}
            >
                <FormSection>
                    <FormField label={t('RESELLER.PASSWORDSETTING.NEWPASSWORD', { defaultValue: 'رمز جدید' })} required error={passwordForm.formState.errors.new_password?.message} fullWidth>
                        <PasswordInput {...passwordForm.register('new_password')} />
                    </FormField>
                    <FormField label={t('RESELLER.PASSWORDSETTING.CONFIRMPASSWORD', { defaultValue: 'تکرار رمز' })} required error={passwordForm.formState.errors.confirm_new_password?.message} fullWidth>
                        <PasswordInput {...passwordForm.register('confirm_new_password')} />
                    </FormField>
                </FormSection>
            </FormSheet>

            <FormSheet
                open={showPinDialog}
                onOpenChange={setShowPinDialog}
                title={t('RESELLER.PINSETTING.CHANGEPIN', { defaultValue: 'تغییر پین' })}
                description={singleReseller.reseller_name}
                size="md"
                side="left"
                footer={<FormActions onCancel={() => setShowPinDialog(false)} onSubmit={handlePinChange} cancelLabel={t('APP.GENERAL.CANCEL', { defaultValue: 'انصراف' })} submitLabel={t('FORM.GENERAL.SUBMIT', { defaultValue: 'ذخیره' })} />}
            >
                <FormSection>
                    <FormField label={t('RESELLER.PINSETTING.NEWPIN', { defaultValue: 'پین جدید' })} required error={pinForm.formState.errors.new_pin?.message} fullWidth>
                        <PasswordInput inputMode="numeric" maxLength={4} {...pinForm.register('new_pin')} />
                    </FormField>
                    <FormField label={t('RESELLER.PINSETTING.CONFIRMPIN', { defaultValue: 'تکرار پین' })} required error={pinForm.formState.errors.confirm_new_pin?.message} fullWidth>
                        <PasswordInput inputMode="numeric" maxLength={4} {...pinForm.register('confirm_new_pin')} />
                    </FormField>
                </FormSection>
            </FormSheet>

            <FormSheet
                open={statusOpen}
                onOpenChange={setStatusOpen}
                title={active ? t('RESELLER.PROFILE.DEACTIVATE_TITLE', { defaultValue: 'غیرفعال کردن فروشنده' }) : t('RESELLER.PROFILE.ACTIVATE_TITLE', { defaultValue: 'فعال کردن فروشنده' })}
                description={singleReseller.reseller_name}
                size="md"
                side="left"
                footer={
                    <ConfirmActions
                        onCancel={() => setStatusOpen(false)}
                        onConfirm={confirmStatus}
                        cancelLabel={t('APP.GENERAL.CANCEL', { defaultValue: 'انصراف' })}
                        confirmLabel={statusBusy ? t('SAVING', { defaultValue: 'در حال ذخیره...' }) : active ? t('RESELLER.PROFILE.DEACTIVATE_CONFIRM', { defaultValue: 'غیرفعال شود' }) : t('RESELLER.PROFILE.ACTIVATE_CONFIRM', { defaultValue: 'فعال شود' })}
                        danger={active}
                    />
                }
            >
                <p className="text-sm text-muted-foreground">
                    {active
                        ? t('RESELLER.PROFILE.DEACTIVATE_HINT', { defaultValue: 'این فروشنده دیگر نمی‌تواند وارد شود و کار کند.' })
                        : t('RESELLER.PROFILE.ACTIVATE_HINT', { defaultValue: 'این فروشنده دوباره می‌تواند وارد شود و کار کند.' })}
                </p>
            </FormSheet>

            <ResellerMoneySheets
                kind={money}
                reseller={singleReseller}
                toast={toast}
                onClose={() => setMoney(null)}
                onSaved={(kind) => {
                    const key = kind === 'payment' ? 'payments' : kind === 'balance' ? 'balances' : 'hawala';
                    setLists((prev) => ({ ...prev, [key]: prev[key] + 1 }));
                    setTab(kind === 'payment' ? 'payments' : kind === 'balance' ? 'balances' : 'hawala');
                    dispatch(_getResellerById(Number(params.id)));
                }}
            />
            <ResellerParentSheet reseller={singleReseller} toast={toast} open={parentOpen} onClose={() => setParentOpen(false)} />
            <ResellerAttachSheet
                resellerId={Number(params.id)}
                toast={toast}
                open={attachOpen}
                onClose={() => setAttachOpen(false)}
                onSaved={() => setLists((prev) => ({ ...prev, subs: prev.subs + 1 }))}
            />
        </div>
    );
};

export default ResellerDetailsPage;
