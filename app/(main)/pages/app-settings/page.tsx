/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { FileDrop } from '@/components/ui/file-drop';
import { TagInput } from '@/components/ui/tag-input';
import { Checkbox } from '@/components/ui/checkbox';
import { PageHeader } from '@/components/admin/page-header';
import { Button as UiButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Menu, Settings2 } from 'lucide-react';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyleImage } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { fetchAppSettings, updateAppSettings } from '@/app/redux/actions/appSettingsActions';
import { AppSettings, Currency, Provider, SupportContacts, TelegramChat } from '@/types/interface';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import {
    _fetchSupportContacts,
    _addSupportContact,
    _editSupportContact,
    _deleteSupportContact
} from '@/app/redux/actions/supportContactActions';
import { _fetchProviders } from '@/app/redux/actions/providerActions';
import { _fetchTelegramList } from '@/app/redux/actions/telegramActions';

type AppSettingsWithInquiry = AppSettings & {
    default_package_inquiry_provider_id?: number | null;
    paystore_dynamic_bundle_markup_mode?: 'percentage' | 'fixed';
    paystore_dynamic_bundle_markup_percentage?: number | null;
    paystore_dynamic_bundle_markup_fixed_amount?: number | null;
    auto_bind_queried_packages?: boolean;
};


const isActiveInquiryProvider = (provider: Provider): boolean => {
    const code = String(provider.code ?? '').trim().toLowerCase();

    const active = String(
        provider.is_active ?? ''
    ).trim().toLowerCase();

    return ['paystore', 'manshorpay'].includes(code) &&
        (active === 'true' || active === '1');
};


const emptySettings: AppSettingsWithInquiry = {
    is_instant_confirm: false,
    maintenance_mode: false,
    allow_new_registrations: false,
    default_currency: "",
    exchange_rate_usd_afn: 0,
    support_phone: "",
    support_email: "",
    support_whatsapp: "",
    alternative_contact_phone: "",
    alternative_whatsapp: "",
    telegram_username: "",
    telegram_url: "",
    facebook_page_url: "",
    instagram_handle: "",
    instagram_url: "",
    twitter_url: "",
    tiktok_url: "",
    youtube_url: "",
    website_url: "",
    app_name: "",
    app_name_i18n: {
        en: "",
        fa: "",
        ps: ""
    },
    app_slogan: "",
    app_slogan_i18n: {
        en: "",
        fa: "",
        ps: ""
    },
    logo_url: "",
    mobile_app_primary_color: "#3498db",
    mobile_app_secondary_color: "#FFC107",
    primary_color_font_color: "#FFFFFF",
    secondary_color_font_color: "#000000",
    extra_settings: {
        max_order_per_day: 0,
        min_topup_amount: 0,
        max_topup_amount: 0
    },
    integration_settings: {
        SETARAGAN_API_BASE_URL: "",
        SETARAGAN_API_USERNAME: "",
        SETARAGAN_API_AUTHKEY: "",
        SETARAGAN_MSISDN: "",
        SETARAGAN_REQUEST_ID: "",
        TELEGRAM_WEBHOOK_URL: "",
        TELEGRAM_BOT_TOKEN: ""
    },
    afg_custom_recharge_adjust_type: "decrease",
    afg_custom_recharge_adjust_mode: "percentage",
    afg_custom_recharge_adjust_value: 10,
    afg_custom_recharge_selling_price_adjust_type: "decrease",
    afg_custom_recharge_selling_price_adjust_mode: "percentage",
    afg_custom_recharge_selling_price_adjust_value: 0,
    setaragan_admin_buying_price_percentage: 0,
    custom_recharge_api_provider_id: null,
    default_package_inquiry_provider_id: null,
    paystore_dynamic_bundle_markup_mode: 'percentage',
    paystore_dynamic_bundle_markup_percentage: 10,
    paystore_dynamic_bundle_markup_fixed_amount: 0,
    auto_bind_queried_packages: true,
    // New Telegram settings
    telegram_enabled: false,
    telegram_send_payments: false,
    telegram_payment_chat_ids: [],
    telegram_send_balances: false,
    telegram_balance_chat_ids: [],
    telegram_send_transactions: false,
    telegram_transaction_chat_ids: [],
    telegram_send_vouchers: false,
    telegram_voucher_chat_ids: []
};

const emptySupportContact: SupportContacts = {
    id: 0,
    title: "",
    description: "",
    phone: "",
    is_whatsapp: false,
    is_phone: false,
    status: "active",
    links: {
        telegram: "",
        website: ""
    }
};

const AppSettingsPage = () => {
    const [settings, setSettings] = useState<AppSettingsWithInquiry>(emptySettings);
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [mobileNavVisible, setMobileNavVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Support Contacts States
    const [supportContacts, setSupportContacts] = useState<SupportContacts[]>([]);
    const [supportContactDialog, setSupportContactDialog] = useState(false);
    const [deleteSupportContactDialog, setDeleteSupportContactDialog] = useState(false);
    const [selectedSupportContact, setSelectedSupportContact] = useState<SupportContacts>(emptySupportContact);
    const [supportContactSubmitted, setSupportContactSubmitted] = useState(false);

    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { loading, settings: reduxSettings } = useSelector((state: any) => state.appSettingsReducer);
    const { loading: supportContactsLoading, supportContacts: reduxSupportContacts } = useSelector((state: any) => state.supportContactReducer);
    const { t } = useTranslation();
    const { currencies } = useSelector((state: any) => state.currenciesReducer);
    const { providers } = useSelector((state: any) => state.providerReducer);
    const { telegramChatIds } = useSelector((state: any) => state.telegramReducer);
    const inquiryProviderOptions = (Array.isArray(providers) ? providers : [])
        .filter((provider: Provider) => isActiveInquiryProvider(provider))
        .map((provider: Provider) => ({
            label: `${provider.name} (${provider.code})`,
            value: Number(provider.id)
        }));

    useEffect(() => {
        dispatch(fetchAppSettings());
        dispatch(_fetchCurrencies());
        dispatch(_fetchSupportContacts());
        dispatch(_fetchProviders(1, '', { per_page: 100 }));
        dispatch(_fetchTelegramList());

        // Check if device is mobile
        const checkIsMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkIsMobile();
        window.addEventListener('resize', checkIsMobile);

        return () => {
            window.removeEventListener('resize', checkIsMobile);
        };
    }, [dispatch]);

    useEffect(() => {
        if (reduxSupportContacts) {
            setSupportContacts(reduxSupportContacts);
        }
    }, [reduxSupportContacts]);

    const selectedCurrency = currencies?.find((currency: Currency) =>
        currency.code === settings.default_currency
    );

    // Update exchange rate when currency changes
    useEffect(() => {
        if (selectedCurrency && settings.default_currency) {
            setSettings(prev => ({
                ...prev,
                exchange_rate_usd_afn: parseFloat(selectedCurrency.exchange_rate_per_usd) || 0
            }));
        }
    }, [settings.default_currency, selectedCurrency]);

    useEffect(() => {
        if (reduxSettings) {
            setSettings({
                ...reduxSettings,
                default_package_inquiry_provider_id: reduxSettings.default_package_inquiry_provider_id == null
                    ? null : Number(reduxSettings.default_package_inquiry_provider_id),
                paystore_dynamic_bundle_markup_mode:
                    reduxSettings.paystore_dynamic_bundle_markup_mode === 'fixed' ? 'fixed' : 'percentage',
                paystore_dynamic_bundle_markup_percentage:
                    reduxSettings.paystore_dynamic_bundle_markup_percentage == null
                        ? 10 : Number(reduxSettings.paystore_dynamic_bundle_markup_percentage),
                paystore_dynamic_bundle_markup_fixed_amount:
                    reduxSettings.paystore_dynamic_bundle_markup_fixed_amount == null
                        ? 0 : Number(reduxSettings.paystore_dynamic_bundle_markup_fixed_amount),
                auto_bind_queried_packages:
                    reduxSettings.auto_bind_queried_packages == null
                        ? true : reduxSettings.auto_bind_queried_packages === true || reduxSettings.auto_bind_queried_packages === 1
            });
        }
    }, [reduxSettings]);

    const openSettings = () => {
        setSettingsDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setSettingsDialog(false);
    };

    const saveSettings = async () => {
        setSubmitted(true);

        if (!settings.app_name || !settings.support_email || !settings.support_phone) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }
        const saved = await dispatch(updateAppSettings(settings, toast, t));
        if (saved) {
            setSettingsDialog(false);
            setSubmitted(false);
        }
    };

    // Support Contacts Functions
    const openNewSupportContact = () => {
        setSelectedSupportContact(emptySupportContact);
        setSupportContactSubmitted(false);
        setSupportContactDialog(true);
    };

    const hideSupportContactDialog = () => {
        setSupportContactSubmitted(false);
        setSupportContactDialog(false);
    };

    const hideDeleteSupportContactDialog = () => {
        setDeleteSupportContactDialog(false);
    };

    const editSupportContact = (supportContact: SupportContacts) => {
        setSelectedSupportContact({ ...supportContact });
        setSupportContactDialog(true);
    };

    const confirmDeleteSupportContact = (supportContact: SupportContacts) => {
        setSelectedSupportContact(supportContact);
        setDeleteSupportContactDialog(true);
    };

    const saveSupportContact = () => {
        setSupportContactSubmitted(true);

        if (!selectedSupportContact.title || !selectedSupportContact.phone) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
                life: 3000
            });
            return;
        }

        if (selectedSupportContact.id) {
            dispatch(_editSupportContact(selectedSupportContact, toast, t));
        } else {
            dispatch(_addSupportContact(selectedSupportContact, toast, t));
        }
        setSupportContactDialog(false);
    };

    const deleteSupportContact = () => {
        dispatch(_deleteSupportContact(selectedSupportContact.id, toast, t));
        setDeleteSupportContactDialog(false);
        setSelectedSupportContact(emptySupportContact);
    };

    const settingsTabKeys = ['general', 'contact', 'branding', 'limits', 'integration', 'recharge', 'package-inquiry', 'telegram', 'support-contacts'] as const;

    const deleteSupportContactDialogFooter = (
        <>
            <Button label={t('NO')} icon="pi pi-times" severity="secondary" onClick={hideDeleteSupportContactDialog} />
            <Button label={t('YES')} icon="pi pi-check" severity="danger" onClick={deleteSupportContact} />
        </>
    );

    const statusBodyTemplate = (rowData: SupportContacts) => {
        return (
            <span className={`customer-badge status-${rowData.status}`}>
                {rowData.status === 'active' ? t('ACTIVE') : t('INACTIVE')}
            </span>
        );
    };

    const actionBodyTemplate = (rowData: SupportContacts) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    severity="info"
                    rounded
                    size="small"
                    onClick={() => editSupportContact(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    severity="danger"
                    rounded
                    size="small"
                    onClick={() => confirmDeleteSupportContact(rowData)}
                />
            </div>
        );
    };

    const renderSupportContactsTab = () => {
        return (
            <div className="grid">
                <div className="col-12">
                    <div className="card">
                        <div className="mb-4 flex justify-end">
                            <Button
                                label={t('SUPPORT_CONTACT.ADD_NEW')}
                                icon="pi pi-plus"
                                severity="success"
                                onClick={openNewSupportContact}
                            />
                        </div>

                        <DataTable
                            value={supportContacts}
                            loading={supportContactsLoading}
                            responsiveLayout="scroll"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            emptyMessage={t('SUPPORT_CONTACT.NO_CONTACTS_FOUND')}
                        >
                            <Column field="title" header={t('SUPPORT_CONTACT.TITLE')} sortable style={{ minWidth: '200px' }} />
                            <Column field="description" header={t('SUPPORT_CONTACT.DESCRIPTION')} sortable style={{ minWidth: '250px' }} />
                            <Column field="phone" header={t('SUPPORT_CONTACT.PHONE')} sortable style={{ minWidth: '150px' }} />
                            <Column field="is_whatsapp" header={t('SUPPORT_CONTACT.IS_WHATSAPP')} body={(rowData) => rowData.is_whatsapp ? t('YES') : t('NO')} style={{ minWidth: '120px' }} />
                            <Column field="is_phone" header={t('SUPPORT_CONTACT.IS_PHONE')} body={(rowData) => rowData.is_phone ? t('YES') : t('NO')} style={{ minWidth: '120px' }} />
                            <Column field="status" header={t('STATUS')} body={statusBodyTemplate} sortable style={{ minWidth: '100px' }} />
                            <Column body={actionBodyTemplate} style={{ minWidth: '120px' }} />
                        </DataTable>
                    </div>
                </div>
            </div>
        );
    };

    const getChatIds = (value: string[] | null | undefined): string[] => {
        if (!value) return [];
        if (Array.isArray(value)) return value;
        return [];
    };

    const renderTelegramChatCheckboxes = (
        field: 'telegram_payment_chat_ids' | 'telegram_balance_chat_ids' | 'telegram_transaction_chat_ids' | 'telegram_voucher_chat_ids',
        inputId: string
    ) => {
        const selected = getChatIds(settings[field]);
        return (
            <div id={inputId} className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-emerald-100 p-2 text-start">
                {(telegramChatIds || []).map((chat: TelegramChat) => {
                    const chatId = String(chat.chat_id);
                    const checked = selected.includes(chatId);
                    return (
                        <div key={chatId} className="flex items-center gap-2">
                            <Checkbox
                                id={`${inputId}-${chatId}`}
                                checked={checked}
                                onCheckedChange={(c) => {
                                    const next = c === true ? [...selected, chatId] : selected.filter((id) => id !== chatId);
                                    setSettings({ ...settings, [field]: next });
                                }}
                            />
                            <label htmlFor={`${inputId}-${chatId}`} className="text-sm">
                                {chat.group_name} ({chat.chat_id})
                            </label>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="app_name" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_NAME')} *
                                </label>
                                <Input
                                    id="app_name"
                                    value={settings.app_name}
                                    onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                                    required
                                    className={classNames('w-full', {
                                        'p-invalid': submitted && !settings.app_name
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="app_slogan" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_SLOGAN')}
                                </label>
                                <Input className="w-full"
                                    id="app_slogan"
                                    value={settings.app_slogan}
                                    onChange={(e) => setSettings({ ...settings, app_slogan: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="default_currency" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.DEFAULT_CURRENCY')}
                                </label>
                                <SearchSelect
                                    value={(currencies || []).find((c: Currency) => c.code === settings.default_currency) || null}
                                    options={currencies || []}
                                    onChange={(selected: Currency | null) =>
                                        setSettings({ ...settings, default_currency: selected?.code ?? '' })
                                    }
                                    optionLabel="code"
                                    placeholder={t('CURRENCY.GENERAL.SELECTCURRENCY')}
                                    returnFullObject
                                    itemTemplate={(option: Currency) => (
                                        <div className="flex w-full items-center justify-between gap-2">
                                            <span>{option.code}</span>
                                            <span className="text-xs text-muted-foreground">{option.name}</span>
                                        </div>
                                    )}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="exchange_rate" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.EXCHANGE_RATE')}
                                </label>
                                <NumberInput
                                    id="exchange_rate"
                                    value={settings.exchange_rate_usd_afn}
                                    onValueChange={(v) => setSettings({ ...settings, exchange_rate_usd_afn: v ?? 0 })}
                                    disabled={!settings.default_currency}
                                />
                                {selectedCurrency && (
                                    <small className="text-sm text-500">
                                        {t('CURRENCY.GENERAL.BASE_RATE')}: {selectedCurrency.exchange_rate_per_usd}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="website_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.WEBSITE_URL')}
                                </label>
                                <Input className="w-full"
                                    id="website_url"
                                    value={settings.website_url}
                                    onChange={(e) => setSettings({ ...settings, website_url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label className="font-bold text-sm md:text-base">{t('APP_SETTINGS.FEATURES')}</label>
                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center">
                                        <Switch
                                            checked={settings.is_instant_confirm}
                                            onCheckedChange={(v) => setSettings({ ...settings, is_instant_confirm: v })}
                                        />
                                        <label className="ml-2 text-sm md:text-base">{t('APP_SETTINGS.INSTANT_CONFIRM')}</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Switch
                                            checked={settings.maintenance_mode}
                                            onCheckedChange={(v) => setSettings({ ...settings, maintenance_mode: v })}
                                        />
                                        <label className="ml-2 text-sm md:text-base">{t('APP_SETTINGS.MAINTENANCE_MODE')}</label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <Switch
                                            checked={settings.allow_new_registrations}
                                            onCheckedChange={(v) => setSettings({ ...settings, allow_new_registrations: v })}
                                        />
                                        <label className="ml-2 text-sm md:text-base">{t('APP_SETTINGS.ALLOW_REGISTRATIONS')}</label>
                                    </div>
                                </div>
                            </div>

                            <div className="field">
                                <label htmlFor="app_name_en" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_NAME_EN')}
                                </label>
                                <Input className="w-full"
                                    id="app_name_en"
                                    value={settings.app_name_i18n?.en}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        app_name_i18n: { ...settings.app_name_i18n, en: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="app_name_fa" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_NAME_FA')}
                                </label>
                                <Input className="w-full"
                                    id="app_name_fa"
                                    value={settings.app_name_i18n?.fa}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        app_name_i18n: { ...settings.app_name_i18n, fa: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="app_name_ps" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_NAME_PS')}
                                </label>
                                <Input className="w-full"
                                    id="app_name_ps"
                                    value={settings.app_name_i18n?.ps}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        app_name_i18n: { ...settings.app_name_i18n, ps: e.target.value }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="app_slogan_en" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_SLOGAN_EN')}
                                </label>
                                <Input className="w-full"
                                    id="app_slogan_en"
                                    value={settings.app_slogan_i18n?.en}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        app_slogan_i18n: { ...settings.app_slogan_i18n, en: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="app_slogan_fa" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_SLOGAN_FA')}
                                </label>
                                <Input className="w-full"
                                    id="app_slogan_fa"
                                    value={settings.app_slogan_i18n?.fa}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        app_slogan_i18n: { ...settings.app_slogan_i18n, fa: e.target.value }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="app_slogan_ps" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.APP_SLOGAN_PS')}
                                </label>
                                <Input className="w-full"
                                    id="app_slogan_ps"
                                    value={settings.app_slogan_i18n?.ps}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        app_slogan_i18n: { ...settings.app_slogan_i18n, ps: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'contact':
                return (
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="support_phone" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SUPPORT_PHONE')} *
                                </label>
                                <Input className="w-full"
                                    id="support_phone"
                                    value={settings.support_phone}
                                    onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="support_email" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SUPPORT_EMAIL')} *
                                </label>
                                <Input className="w-full"
                                    id="support_email"
                                    value={settings.support_email}
                                    onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="support_whatsapp" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SUPPORT_WHATSAPP')}
                                </label>
                                <Input className="w-full"
                                    id="support_whatsapp"
                                    value={settings.support_whatsapp}
                                    onChange={(e) => setSettings({ ...settings, support_whatsapp: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="alternative_phone" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.ALTERNATIVE_PHONE')}
                                </label>
                                <Input className="w-full"
                                    id="alternative_phone"
                                    value={settings.alternative_contact_phone}
                                    onChange={(e) => setSettings({ ...settings, alternative_contact_phone: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="alternative_whatsapp" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.ALTERNATIVE_WHATSAPP')}
                                </label>
                                <Input className="w-full"
                                    id="alternative_whatsapp"
                                    value={settings.alternative_whatsapp}
                                    onChange={(e) => setSettings({ ...settings, alternative_whatsapp: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="telegram_username" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.TELEGRAM_USERNAME')}
                                </label>
                                <Input className="w-full"
                                    id="telegram_username"
                                    value={settings.telegram_username}
                                    onChange={(e) => setSettings({ ...settings, telegram_username: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="telegram_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.TELEGRAM_URL')}
                                </label>
                                <Input className="w-full"
                                    id="telegram_url"
                                    value={settings.telegram_url}
                                    onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="facebook_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.FACEBOOK_URL')}
                                </label>
                                <Input className="w-full"
                                    id="facebook_url"
                                    value={settings.facebook_page_url}
                                    onChange={(e) => setSettings({ ...settings, facebook_page_url: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="instagram_handle" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.INSTAGRAM_HANDLE')}
                                </label>
                                <Input className="w-full"
                                    id="instagram_handle"
                                    value={settings.instagram_handle}
                                    onChange={(e) => setSettings({ ...settings, instagram_handle: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="instagram_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.INSTAGRAM_URL')}
                                </label>
                                <Input className="w-full"
                                    id="instagram_url"
                                    value={settings.instagram_url}
                                    onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="twitter_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.TWITTER_URL')}
                                </label>
                                <Input className="w-full"
                                    id="twitter_url"
                                    value={settings.twitter_url}
                                    onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="tiktok_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.TIKTOK_URL')}
                                </label>
                                <Input className="w-full"
                                    id="tiktok_url"
                                    value={settings.tiktok_url}
                                    onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="youtube_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.YOUTUBE_URL')}
                                </label>
                                <Input className="w-full"
                                    id="youtube_url"
                                    value={settings.youtube_url}
                                    onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'branding':
                return (
                    <div className="grid p-fluid">
                        <div className="col-12">
                            {settings.logo_url && (
                                <img
                                    src={settings.logo_url}
                                    alt="App Logo"
                                    width="150"
                                    className="mt-0 mx-auto mb-5 block shadow-2"
                                />
                            )}
                            <FileDrop
                                accept="image/*"
                                previewUrl={typeof settings.logo_url === 'string' ? settings.logo_url : null}
                                onChange={() => {}}
                            />
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="primary_color" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.PRIMARY_COLOR')}
                                </label>
                                <Input
                                    type="color"
                                    id="primary_color"
                                    value={settings.mobile_app_primary_color}
                                    onChange={(e) => setSettings({ ...settings, mobile_app_primary_color: e.target.value })}
                                    className="h-10 w-full max-w-[12rem] cursor-pointer rounded-md border border-emerald-200 p-1"
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="primary_font_color" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.PRIMARY_FONT_COLOR')}
                                </label>
                                <Input
                                    type="color"
                                    id="primary_font_color"
                                    value={settings.primary_color_font_color}
                                    onChange={(e) => setSettings({ ...settings, primary_color_font_color: e.target.value })}
                                    className="h-10 w-full max-w-[12rem] cursor-pointer rounded-md border border-emerald-200 p-1"
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="secondary_color" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SECONDARY_COLOR')}
                                </label>
                                <Input
                                    type="color"
                                    id="secondary_color"
                                    value={settings.mobile_app_secondary_color}
                                    onChange={(e) => setSettings({ ...settings, mobile_app_secondary_color: e.target.value })}
                                    className="h-10 w-full max-w-[12rem] cursor-pointer rounded-md border border-emerald-200 p-1"
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="secondary_font_color" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SECONDARY_FONT_COLOR')}
                                </label>
                                <Input
                                    type="color"
                                    id="secondary_font_color"
                                    value={settings.secondary_color_font_color}
                                    onChange={(e) => setSettings({ ...settings, secondary_color_font_color: e.target.value })}
                                    className="h-10 w-full max-w-[12rem] cursor-pointer rounded-md border border-emerald-200 p-1"
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'limits':
                return (
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="max_orders" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.MAX_ORDERS_PER_DAY')}
                                </label>
                                <NumberInput
                                    id="max_orders"
                                    value={settings?.extra_settings?.max_order_per_day || 0}
                                    onValueChange={(v) => setSettings({
                                        ...settings,
                                        extra_settings: { ...settings.extra_settings, max_order_per_day: v ?? 0 }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="min_topup" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.MIN_TOPUP_AMOUNT')}
                                </label>
                                <NumberInput
                                    id="min_topup"
                                    value={settings?.extra_settings?.min_topup_amount}
                                    onValueChange={(v) => setSettings({
                                        ...settings,
                                        extra_settings: { ...settings.extra_settings, min_topup_amount: v ?? 0 }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-4">
                            <div className="field">
                                <label htmlFor="max_topup" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.MAX_TOPUP_AMOUNT')}
                                </label>
                                <NumberInput
                                    id="max_topup"
                                    value={settings?.extra_settings?.max_topup_amount}
                                    onValueChange={(v) => setSettings({
                                        ...settings,
                                        extra_settings: { ...settings.extra_settings, max_topup_amount: v ?? 0 }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'integration':
                return (
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="api_base_url" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.API_BASE_URL')}
                                </label>
                                <Input className="w-full"
                                    id="api_base_url"
                                    value={settings.integration_settings.SETARAGAN_API_BASE_URL}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        integration_settings: {
                                            ...settings.integration_settings,
                                            SETARAGAN_API_BASE_URL: e.target.value
                                        }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="api_username" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.API_USERNAME')}
                                </label>
                                <Input className="w-full"
                                    id="api_username"
                                    value={settings.integration_settings.SETARAGAN_API_USERNAME}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        integration_settings: {
                                            ...settings.integration_settings,
                                            SETARAGAN_API_USERNAME: e.target.value
                                        }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="api_authkey" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.API_AUTHKEY')}
                                </label>
                                <Input className="w-full"
                                    id="api_authkey"
                                    value={settings.integration_settings.SETARAGAN_API_AUTHKEY}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        integration_settings: {
                                            ...settings.integration_settings,
                                            SETARAGAN_API_AUTHKEY: e.target.value
                                        }
                                    })}
                                />
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="api_msisdn" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.API_MSISDN')}
                                </label>
                                <Input className="w-full"
                                    id="api_msisdn"
                                    value={settings.integration_settings.SETARAGAN_MSISDN}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        integration_settings: {
                                            ...settings.integration_settings,
                                            SETARAGAN_MSISDN: e.target.value
                                        }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="api_request_id" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.API_REQUEST_ID')}
                                </label>
                                <Input className="w-full"
                                    id="api_request_id"
                                    value={settings.integration_settings.SETARAGAN_REQUEST_ID}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        integration_settings: {
                                            ...settings.integration_settings,
                                            SETARAGAN_REQUEST_ID: e.target.value
                                        }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="telegram_webhook" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.TELEGRAM_WEBHOOK')}
                                </label>
                                <Input className="w-full"
                                    id="telegram_webhook"
                                    value={settings.integration_settings.TELEGRAM_WEBHOOK_URL}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        integration_settings: {
                                            ...settings.integration_settings,
                                            TELEGRAM_WEBHOOK_URL: e.target.value
                                        }
                                    })}
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="telegram_bot_token" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.TELEGRAM_BOT_TOKEN')}
                                </label>
                                <Input className="w-full"
                                    id="telegram_bot_token"
                                    value={settings.integration_settings.TELEGRAM_BOT_TOKEN}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        integration_settings: {
                                            ...settings.integration_settings,
                                            TELEGRAM_BOT_TOKEN: e.target.value
                                        }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                );

            case 'recharge':
                return (
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="recharge_adjust_type" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.RECHARGE_ADJUST_TYPE')}
                                </label>
                                <Select
                                    value={settings.afg_custom_recharge_adjust_type ?? undefined}
                                    onValueChange={(v) => setSettings({ ...settings, afg_custom_recharge_adjust_type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('APP_SETTINGS.SELECT_TYPE')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="decrease">{t('APP_SETTINGS.DECREASE')}</SelectItem>
                                        <SelectItem value="increase">{t('APP_SETTINGS.INCREASE')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="field">
                                <label htmlFor="recharge_adjust_mode" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.RECHARGE_ADJUST_MODE')}
                                </label>
                                <Select
                                    value={settings.afg_custom_recharge_adjust_mode ?? undefined}
                                    onValueChange={(v) => setSettings({ ...settings, afg_custom_recharge_adjust_mode: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('APP_SETTINGS.SELECT_MODE')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">{t('APP_SETTINGS.PERCENTAGE')}</SelectItem>
                                        <SelectItem value="fixed">{t('APP_SETTINGS.FIXED')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="field">
                                <label htmlFor="recharge_adjust_value" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.RECHARGE_ADJUST_VALUE')}
                                </label>
                                <NumberInput
                                    id="recharge_adjust_value"
                                    value={settings.afg_custom_recharge_adjust_value}
                                    onValueChange={(v) => setSettings({
                                        ...settings,
                                        afg_custom_recharge_adjust_value: v ?? 0
                                    })}
                                    min={0}
                                />
                                {settings.afg_custom_recharge_adjust_mode === "percentage" && (
                                    <small className="text-sm text-500">
                                        {t('APP_SETTINGS.PERCENTAGE_NOTE')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="selling_price_adjust_type" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SELLING_PRICE_ADJUST_TYPE')}
                                </label>
                                <Select
                                    value={settings.afg_custom_recharge_selling_price_adjust_type ?? undefined}
                                    onValueChange={(v) => setSettings({ ...settings, afg_custom_recharge_selling_price_adjust_type: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('APP_SETTINGS.SELECT_TYPE')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="decrease">{t('APP_SETTINGS.DECREASE')}</SelectItem>
                                        <SelectItem value="increase">{t('APP_SETTINGS.INCREASE')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="col-12 md:col-6">
                            <div className="field">
                                <label htmlFor="selling_price_adjust_mode" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SELLING_PRICE_ADJUST_MODE')}
                                </label>
                                <Select
                                    value={settings.afg_custom_recharge_selling_price_adjust_mode ?? undefined}
                                    onValueChange={(v) => setSettings({ ...settings, afg_custom_recharge_selling_price_adjust_mode: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('APP_SETTINGS.SELECT_MODE')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">{t('APP_SETTINGS.PERCENTAGE')}</SelectItem>
                                        <SelectItem value="fixed">{t('APP_SETTINGS.FIXED')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="field">
                                <label htmlFor="selling_price_adjust_value" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SELLING_PRICE_ADJUST_VALUE')}
                                </label>
                                <NumberInput
                                    id="selling_price_adjust_value"
                                    value={settings.afg_custom_recharge_selling_price_adjust_value}
                                    onValueChange={(v) => setSettings({
                                        ...settings,
                                        afg_custom_recharge_selling_price_adjust_value: v ?? 0
                                    })}
                                    min={0}
                                />
                                {settings.afg_custom_recharge_selling_price_adjust_mode === "percentage" && (
                                    <small className="text-sm text-500">
                                        {t('APP_SETTINGS.SELLING_PRICE_PERCENTAGE_NOTE')}
                                    </small>
                                )}
                            </div>

                            <div className="field">
                                <label htmlFor="setaragan_admin_buying_price_percentage" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.SETARAGAN_ADMIN_BUYING_PRICE_PERCENTAGE')}
                                </label>
                                <NumberInput
                                    id="setaragan_admin_buying_price_percentage"
                                    value={settings.setaragan_admin_buying_price_percentage}
                                    onValueChange={(v) => setSettings({
                                        ...settings,
                                        setaragan_admin_buying_price_percentage: v ?? 0
                                    })}
                                    min={0}
                                    max={100}
                                />
                                <small className="text-sm text-500">
                                    {t('APP_SETTINGS.SETARAGAN_ADMIN_BUYING_PRICE_NOTE')}
                                </small>
                            </div>

                            <div className="field">
                                <label htmlFor="custom_recharge_api_provider_id" className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.CUSTOM_RECHARGE_API_PROVIDER')}
                                </label>
                                <SearchSelect
                                    value={(providers || []).find((p: Provider) => p.id === settings.custom_recharge_api_provider_id) || null}
                                    options={providers || []}
                                    onChange={(selected: Provider | null) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            custom_recharge_api_provider_id: selected?.id ?? null
                                        }))
                                    }
                                    optionLabel="name"
                                    placeholder="Select Provider"
                                    returnFullObject
                                    showClear
                                />
                                <small className="text-sm text-500">
                                    {t('APP_SETTINGS.CUSTOM_RECHARGE_API_PROVIDER_DESC')}
                                </small>
                            </div>
                        </div>

                        <div className="col-12">
                            <div className="field">
                                <label className="font-bold text-sm md:text-base">
                                    {t('APP_SETTINGS.RECHARGE_SETTINGS_DESCRIPTION')}
                                </label>
                                <div className="p-3 border-1 surface-border border-round">
                                    <p className="text-sm text-500 mb-2">
                                        {t('APP_SETTINGS.RECHARGE_TYPE_DESC')}
                                    </p>
                                    <p className="text-sm text-500 mb-2">
                                        {t('APP_SETTINGS.RECHARGE_MODE_DESC')}
                                    </p>
                                    <p className="text-sm text-500 mb-2">
                                        {t('APP_SETTINGS.RECHARGE_VALUE_DESC')}
                                    </p>
                                    <p className="text-sm text-500 mb-2">
                                        {t('APP_SETTINGS.SELLING_PRICE_ADJUST_DESC')}
                                    </p>
                                    <p className="text-sm text-500">
                                        {t('APP_SETTINGS.SETARAGAN_ADMIN_BUYING_PRICE_DESC')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );


// ... inside the component

case 'package-inquiry':
                return (
                    <div className="grid p-fluid">
                        <div className="col-12 md:col-8">
                            <div className="field">
                                <label htmlFor="default_package_inquiry_provider_id" className="font-bold text-sm md:text-base">
                                    Default Package Inquiry Provider
                                </label>
                                <Select
                                    value={
                                        settings.default_package_inquiry_provider_id != null
                                            ? String(settings.default_package_inquiry_provider_id)
                                            : undefined
                                    }
                                    onValueChange={(v) =>
                                        setSettings((prev) => ({
                                            ...prev,
                                            default_package_inquiry_provider_id: v ? Number(v) : null
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Not configured — select a provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {inquiryProviderOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={String(opt.value)}>
                                                {opt.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <small className="text-500">
                                    Only services whose Package Inquiry Mode is Inherit use this default.
                                    Direct PayStore may be used on Waslat; downstream installations can use their
                                    central Waslat/ManshorPay integration.
                                </small>
                                {inquiryProviderOptions.length === 0 && (
                                    <small className="block text-orange-500 mt-2">
                                        No active supported inquiry provider loaded. Check the Providers page.
                                    </small>
                                )}
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="p-3 border-1 surface-border border-round">
                                <h5 className="mb-2">Dynamic Package Pricing</h5>
                                <p className="text-sm text-500 mb-3">
                                    Configured separately per installation. Fixed amount is added in the
                                    upstream package currency; it is not automatically converted from your
                                    default account currency.
                                </p>
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <label htmlFor="dynamic_markup_mode" className="block font-bold mb-2">Markup Mode</label>
                                        <Select
                                            value={settings.paystore_dynamic_bundle_markup_mode ?? 'percentage'}
                                            onValueChange={(v) =>
                                                setSettings((prev) => ({
                                                    ...prev,
                                                    paystore_dynamic_bundle_markup_mode: v as 'percentage' | 'fixed'
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="fixed">Fixed Amount (package currency)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="col-12 md:col-6">
                                        {(settings.paystore_dynamic_bundle_markup_mode ?? 'percentage') === 'percentage' ? (
                                            <>
                                                <label htmlFor="dynamic_markup_percent" className="block font-bold mb-2">Markup Percentage (%)</label>
                                                <NumberInput
                                                    id="dynamic_markup_percent"
                                                    value={Number(settings.paystore_dynamic_bundle_markup_percentage ?? 10)}
                                                    onValueChange={(v) =>
                                                        setSettings((prev) => ({
                                                            ...prev,
                                                            paystore_dynamic_bundle_markup_percentage: v ?? 0
                                                        }))
                                                    }
                                                    min={0}
                                                    max={100}
                                                    className="w-full"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <label htmlFor="dynamic_markup_fixed" className="block font-bold mb-2">Fixed Markup Amount</label>
                                                <NumberInput
                                                    id="dynamic_markup_fixed"
                                                    value={Number(settings.paystore_dynamic_bundle_markup_fixed_amount ?? 0)}
                                                    onValueChange={(v) =>
                                                        setSettings((prev) => ({
                                                            ...prev,
                                                            paystore_dynamic_bundle_markup_fixed_amount: v ?? 0
                                                        }))
                                                    }
                                                    min={0}
                                                    max={99999999}
                                                    className="w-full"
                                                />
                                            </>
                                        )}
                                    </div>
                                    <div className="col-12">
                                        <div className="flex align-items-center gap-3">
                                            <Switch
                                                id="auto_bind_queried_packages"
                                                checked={settings.auto_bind_queried_packages ?? true}
                                                onCheckedChange={(v) =>
                                                    setSettings((prev) => ({
                                                        ...prev,
                                                        auto_bind_queried_packages: v
                                                    }))
                                                }
                                            />
                                            <label htmlFor="auto_bind_queried_packages" className="font-bold">
                                                Automatically Bind Queried Packages
                                            </label>
                                        </div>
                                        <small className="block text-500 mt-2">
                                            OFF: new eligible packages are stored unbound. ON: new or previously
                                            unbound imported packages can receive provider mappings at the next
                                            inquiry. Switching OFF never removes existing bindings. It does not
                                            enable purchasing; financial operations require a separate review.
                                        </small>
                                    </div>
                                </div>
                                <small className="block text-500 mt-2">
                                    Markup changes apply to newly imported or price-managed packages on
                                    the next fresh inquiry (subject to the inquiry cache), not to manual bundles.
                                </small>
                            </div>
                        </div>
                        <div className="col-12">
                            <div className="p-3 border-1 surface-border border-round">
                                <strong>Routing behavior</strong>
                                <p className="text-sm text-500 mb-2">
                                    Disabled: normal bundles, no inquiry. Inherit: use this default provider.
                                    Provider: use the provider selected in that service s settings.
                                </p>
                                <p className="text-sm text-500 m-0">
                                    Intended for configured Turkey Internet services only. It does not change the
                                    existing Custom Recharge API Provider or purchase fulfillment provider.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'telegram':
                return (
        <div className="grid p-fluid">
            <div className="col-12">
                <div className="field">
                    <label className="font-bold text-sm md:text-base">
                        {t('APP_SETTINGS.TELEGRAM_SETTINGS')}
                    </label>
                    <div className="flex flex-column gap-3 mt-2">
                        <div className="flex align-items-center">
                            <Switch
                                checked={settings.telegram_enabled || false}
                                onCheckedChange={(v) => setSettings({ ...settings, telegram_enabled: v })}
                            />
                            <label className="ml-2 text-sm md:text-base">{t('APP_SETTINGS.TELEGRAM_ENABLED')}</label>
                        </div>
                    </div>
                </div>

                <div className="grid">
                    {/* Payments Section */}
                    <div className="col-12 md:col-6">
                        <div className="field p-3 border-1 surface-border border-round">
                            <div className="flex align-items-center mb-2">
                                <Switch
                                    checked={settings.telegram_send_payments || false}
                                    onCheckedChange={(v) => setSettings({ ...settings, telegram_send_payments: v })}
                                />
                                <label className="ml-2 font-bold">{t('APP_SETTINGS.TELEGRAM_SEND_PAYMENTS')}</label>
                            </div>
                            <div className="field">
                                <label htmlFor="payment_chat_ids" className="text-sm font-bold">
                                    {t('APP_SETTINGS.TELEGRAM_PAYMENT_CHAT_IDS')}
                                </label>
                                {renderTelegramChatCheckboxes('telegram_payment_chat_ids', 'payment_chat_ids')}
                            </div>
                        </div>
                    </div>

                    {/* Balances Section */}
                    <div className="col-12 md:col-6">
                        <div className="field p-3 border-1 surface-border border-round">
                            <div className="flex align-items-center mb-2">
                                <Switch
                                    checked={settings.telegram_send_balances || false}
                                    onCheckedChange={(v) => setSettings({ ...settings, telegram_send_balances: v })}
                                />
                                <label className="ml-2 font-bold">{t('APP_SETTINGS.TELEGRAM_SEND_BALANCES')}</label>
                            </div>
                            <div className="field">
                                <label htmlFor="balance_chat_ids" className="text-sm font-bold">
                                    {t('APP_SETTINGS.TELEGRAM_BALANCE_CHAT_IDS')}
                                </label>
                                {renderTelegramChatCheckboxes('telegram_balance_chat_ids', 'balance_chat_ids')}
                            </div>
                        </div>
                    </div>

                    {/* Transactions Section */}
                    <div className="col-12 md:col-6">
                        <div className="field p-3 border-1 surface-border border-round">
                            <div className="flex align-items-center mb-2">
                                <Switch
                                    checked={settings.telegram_send_transactions || false}
                                    onCheckedChange={(v) => setSettings({ ...settings, telegram_send_transactions: v })}
                                />
                                <label className="ml-2 font-bold">{t('APP_SETTINGS.TELEGRAM_SEND_TRANSACTIONS')}</label>
                            </div>
                            <div className="field">
                                <label htmlFor="transaction_chat_ids" className="text-sm font-bold">
                                    {t('APP_SETTINGS.TELEGRAM_TRANSACTION_CHAT_IDS')}
                                </label>
                                {renderTelegramChatCheckboxes('telegram_transaction_chat_ids', 'transaction_chat_ids')}
                            </div>
                        </div>
                    </div>

                    {/* Vouchers Section */}
                    <div className="col-12 md:col-6">
                        <div className="field p-3 border-1 surface-border border-round">
                            <div className="flex align-items-center mb-2">
                                <Switch
                                    checked={settings.telegram_send_vouchers || false}
                                    onCheckedChange={(v) => setSettings({ ...settings, telegram_send_vouchers: v })}
                                />
                                <label className="ml-2 font-bold">{t('APP_SETTINGS.TELEGRAM_SEND_VOUCHERS')}</label>
                            </div>
                            <div className="field">
                                <label htmlFor="voucher_chat_ids" className="text-sm font-bold">
                                    {t('APP_SETTINGS.TELEGRAM_VOUCHER_CHAT_IDS')}
                                </label>
                                {renderTelegramChatCheckboxes('telegram_voucher_chat_ids', 'voucher_chat_ids')}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Telegram Chat IDs Info - Same as CompanyPage */}
                {telegramChatIds && telegramChatIds.length > 0 && (
                    <div className="field mt-3">
                        <label className="font-bold text-sm md:text-base">
                            {t('APP_SETTINGS.AVAILABLE_TELEGRAM_CHAT_IDS')}
                        </label>
                        <div className="p-3 border-1 surface-border border-round">
                            <div className="flex flex-wrap gap-2">
                                {telegramChatIds.map((chat: TelegramChat) => (
                                    <span key={chat.id} className="p-2 surface-100 border-round text-sm">
                                        {chat.chat_id} ({chat.group_name})
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    case 'support-contacts':
                return renderSupportContactsTab();

            default:
                return null;
        }
    };

    const settingsNavItems: { id: typeof activeTab; label: string }[] = [
        { id: 'general', label: t('APP_SETTINGS.GENERAL') },
        { id: 'contact', label: t('APP_SETTINGS.CONTACT_INFO') },
        { id: 'branding', label: t('APP_SETTINGS.BRANDING') },
        { id: 'limits', label: t('APP_SETTINGS.LIMITS') },
        { id: 'integration', label: t('APP_SETTINGS.INTEGRATION') },
        { id: 'recharge', label: t('APP_SETTINGS.RECHARGE') },
        { id: 'package-inquiry', label: t('APP_SETTINGS.PACKAGE_INQUIRY', { defaultValue: 'استعلام بسته' }) },
        { id: 'telegram', label: t('APP_SETTINGS.TELEGRAM') },
        { id: 'support-contacts', label: t('SUPPORT_CONTACT.TITLE') }
    ];

    const navigationButtons = (
        <nav className="flex flex-col gap-1" aria-label={t('APP_SETTINGS.APP_SETTINGS')}>
            {settingsNavItems.map((item) => (
                <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                        setActiveTab(item.id);
                        setMobileNavVisible(false);
                    }}
                    className={cn(
                        'rounded-lg px-3 py-2 text-start text-sm font-medium transition',
                        activeTab === item.id
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-foreground hover:bg-emerald-50 hover:text-emerald-800'
                    )}
                >
                    {item.label}
                </button>
            ))}
        </nav>
    );

    return (
        <div className="space-y-4">
                    <Toast ref={toast} />
                    <PageHeader
                        title={t('APP_SETTINGS.APP_SETTINGS', { defaultValue: 'تنظیمات اپلیکیشن' })}
                        description={t('APP_SETTINGS.PAGE.DESCRIPTION', { defaultValue: 'پیکربندی عمومی، تماس، برندینگ و یکپارچه‌سازی' })}
                        actions={
                            <UiButton type="button" size="sm" variant="outline" onClick={openSettings}>
                                <Settings2 className="h-4 w-4" />
                                {t('APP_SETTINGS.EDIT_SETTINGS')}
                            </UiButton>
                        }
                    />
                    <div className="waslat-panel relative overflow-hidden p-4 md:p-6">
                        {loading ? <div className="absolute inset-x-0 top-0 z-20 h-0.5 animate-pulse bg-emerald-600" /> : null}
                        {!isMobile ? (
                            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                                <aside className="rounded-xl border border-emerald-100/80 bg-emerald-50/30 p-3">
                                    <h4 className="mb-3 text-start text-base font-semibold md:text-lg">{t('APP_SETTINGS.APP_SETTINGS')}</h4>
                                    {navigationButtons}
                                </aside>
                                <div className="min-w-0 rounded-xl border border-border/60 bg-white p-3 md:p-4">{renderTabContent()}</div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="m-0 flex-1 text-base font-semibold md:text-lg">{t('APP_SETTINGS.APP_SETTINGS')}</h4>
                                    <UiButton type="button" variant="outline" size="icon" onClick={() => setMobileNavVisible(true)}>
                                        <Menu className="h-4 w-4" />
                                    </UiButton>
                                </div>
                                <div className="rounded-xl border border-border/60 bg-white p-3">{renderTabContent()}</div>
                            </div>
                        )}
                    </div>

                    <Sheet open={mobileNavVisible} onOpenChange={setMobileNavVisible}>
                        <SheetContent side="left" className="w-full sm:max-w-xs">
                            <SheetHeader>
                                <SheetTitle>{t('APP_SETTINGS.APP_SETTINGS')}</SheetTitle>
                                <SheetDescription>{t('APP_SETTINGS.SHEET_HINT', { defaultValue: 'بخش تنظیمات را انتخاب کنید.' })}</SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">{navigationButtons}</div>
                        </SheetContent>
                    </Sheet>

            <FormSheet
                open={settingsDialog}
                onOpenChange={(open) => {
                    if (!open) hideDialog();
                }}
                size="full"
                side="left"
                title={t('APP_SETTINGS.APP_SETTINGS')}
                description={t('APP_SETTINGS.SHEET_HINT', { defaultValue: 'تنظیمات کلی اپلیکیشن را در تب‌ها ویرایش و ذخیره کنید.' })}
                footer={
                    <FormActions
                        onCancel={hideDialog}
                        onSubmit={saveSettings}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 text-start">{navigationButtons}</div>
                    <div className="min-w-0 rounded-xl border border-emerald-100 bg-white p-3 md:p-4">{renderTabContent()}</div>
                </div>
            </FormSheet>

            <FormSheet
                open={supportContactDialog}
                onOpenChange={(open) => {
                    if (!open) hideSupportContactDialog();
                }}
                size="lg"
                side="left"
                title={selectedSupportContact.id ? t('SUPPORT_CONTACT.EDIT_CONTACT') : t('SUPPORT_CONTACT.ADD_NEW')}
                description={t('SUPPORT_CONTACT.FORM.HINT', { defaultValue: 'اطلاعات تماس پشتیبانی را تکمیل کنید.' })}
                footer={
                    <FormActions
                        onCancel={hideSupportContactDialog}
                        onSubmit={saveSupportContact}
                        cancelLabel={t('APP.GENERAL.CANCEL')}
                        submitLabel={t('FORM.GENERAL.SUBMIT')}
                    />
                }
            >
                <FormSection title={t('SUPPORT_CONTACT.FORM.SECTION.MAIN', { defaultValue: 'اطلاعات تماس' })}>
                    <FormField
                        label={t('SUPPORT_CONTACT.TITLE')}
                        required
                        fullWidth
                        error={supportContactSubmitted && !selectedSupportContact.title ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="title"
                            value={selectedSupportContact.title}
                            onChange={(e) => setSelectedSupportContact({ ...selectedSupportContact, title: e.target.value })}
                            required
                            autoFocus
                            className={classNames('w-full', {
                                'p-invalid': supportContactSubmitted && !selectedSupportContact.title
                            })}
                        />
                    </FormField>
                    <FormField label={t('SUPPORT_CONTACT.DESCRIPTION')} fullWidth>
                        <Input
                            id="description"
                            value={selectedSupportContact.description}
                            onChange={(e) => setSelectedSupportContact({ ...selectedSupportContact, description: e.target.value })}
                            className="w-full"
                        />
                    </FormField>
                    <FormField
                        label={t('SUPPORT_CONTACT.PHONE')}
                        required
                        error={supportContactSubmitted && !selectedSupportContact.phone ? t('THIS_FIELD_IS_REQUIRED') : null}
                    >
                        <Input
                            id="phone"
                            value={selectedSupportContact.phone}
                            onChange={(e) => setSelectedSupportContact({ ...selectedSupportContact, phone: e.target.value })}
                            required
                            className={classNames('w-full', {
                                'p-invalid': supportContactSubmitted && !selectedSupportContact.phone
                            })}
                        />
                    </FormField>
                    <FormField label={t('SUPPORT_CONTACT.TELEGRAM_LINK')}>
                        <Input
                            id="telegram"
                            value={selectedSupportContact.links.telegram}
                            onChange={(e) =>
                                setSelectedSupportContact({
                                    ...selectedSupportContact,
                                    links: { ...selectedSupportContact.links, telegram: e.target.value }
                                })
                            }
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('SUPPORT_CONTACT.WEBSITE_LINK')}>
                        <Input
                            id="website"
                            value={selectedSupportContact.links.website}
                            onChange={(e) =>
                                setSelectedSupportContact({
                                    ...selectedSupportContact,
                                    links: { ...selectedSupportContact.links, website: e.target.value }
                                })
                            }
                            className="w-full"
                        />
                    </FormField>
                    <FormField label={t('SUPPORT_CONTACT.IS_WHATSAPP')}>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_whatsapp"
                                checked={selectedSupportContact.is_whatsapp}
                                onCheckedChange={(v) => setSelectedSupportContact({ ...selectedSupportContact, is_whatsapp: v })}
                            />
                        </div>
                    </FormField>
                    <FormField label={t('SUPPORT_CONTACT.IS_PHONE')}>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="is_phone"
                                checked={selectedSupportContact.is_phone}
                                onCheckedChange={(v) => setSelectedSupportContact({ ...selectedSupportContact, is_phone: v })}
                            />
                        </div>
                    </FormField>
                    <FormField label={t('STATUS')} fullWidth>
                        <Select
                            value={selectedSupportContact.status || undefined}
                            onValueChange={(v) =>
                                setSelectedSupportContact({
                                    ...selectedSupportContact,
                                    status: v as 'active' | 'inactive'
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={t('SELECT_STATUS')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">{t('ACTIVE')}</SelectItem>
                                <SelectItem value="inactive">{t('INACTIVE')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>
            </FormSheet>

            {/* Delete Support Contact Dialog */}
                    <Dialog
                        visible={deleteSupportContactDialog}
                        style={{ width: '450px' }}
                        header={t('CONFIRM')}
                        modal
                        footer={deleteSupportContactDialogFooter}
                        onHide={hideDeleteSupportContactDialog}
                    >
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>
                                {t('SUPPORT_CONTACT.CONFIRM_DELETE')} <b>{selectedSupportContact.title}</b>?
                            </span>
                        </div>
                    </Dialog>
        </div>
    );
};

export default withAuth(AppSettingsPage);
