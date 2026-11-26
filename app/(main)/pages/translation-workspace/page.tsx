/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button as PrimeButton } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Paginator } from 'primereact/paginator';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { AlertTriangle, CheckCircle2, Clock3, List, Save } from 'lucide-react';

import { AppDispatch } from '@/app/redux/store';
import {
    _fetchTranslationLanguages,
    _fetchTranslationTypes,
    _fetchTranslationWorkspace,
    _markTranslationDirty,
    _resetTranslationDirty,
    _bulkSaveTranslations
} from '@/app/redux/actions/translationActions';
import { _fetchCompanies } from '@/app/redux/actions/companyActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { TranslationField, TranslationItem } from '@/types/translation';
import { customCellStyle } from '@/app/(main)/utilities/customRow';
import { isRTL } from '@/app/(main)/utilities/rtlUtil';
import withAuth from '@/app/(main)/authGuard';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar, type FilterChip } from '@/components/admin/filter-bar';
import { FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { StatCard } from '@/components/admin/stat-card';
import { FormField } from '@/components/admin/form-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const TranslationWorkspacePage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { t } = useTranslation();
    const toast = useRef<Toast>(null);

    const initialType = searchParams.get('type') || 'bundle';
    const initialLang = searchParams.get('language') || '';

    const [selectedType, setSelectedType] = useState<string>(initialType);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);

    const [searchInput, setSearchInput] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    const [translationStatus, setTranslationStatus] = useState<'all' | 'missing' | 'partial' | 'translated'>('all');
    const [sortBy] = useState('id');
    const [sortDirection] = useState<'asc' | 'desc'>('asc');

    const [filterCompanyId, setFilterCompanyId] = useState<number | null>(null);
    const [filterServiceId, setFilterServiceId] = useState<number | null>(null);
    const [filterCategoryType, setFilterCategoryType] = useState<string | null>(null);
    const [filterBundleType, setFilterBundleType] = useState<string | null>(null);
    const [filterValidityType, setFilterValidityType] = useState<string | null>(null);
    const [filterCurrencyId, setFilterCurrencyId] = useState<number | null>(null);
    const [filterApiProviderId, setFilterApiProviderId] = useState<number | null>(null);

    const [filterOpen, setFilterOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);
    const [pendingType, setPendingType] = useState<string | null>(null);

    const { languages, types, workspace, dirtyRows, bulkSave } = useSelector((state: any) => state.translationReducer);
    const { companies } = useSelector((state: any) => state.companyReducer);
    const { services } = useSelector((state: any) => state.serviceReducer);
    const { currencies } = useSelector((state: any) => state.currenciesReducer);

    useEffect(() => {
        dispatch(_fetchTranslationLanguages());
        dispatch(_fetchTranslationTypes());
        dispatch(_fetchCompanies());
        dispatch(_fetchServiceList());
        dispatch(_fetchCurrencies());
    }, [dispatch]);

    useEffect(() => {
        if (!selectedLanguage && languages.length > 0) {
            const fa = languages.find((l: any) => l.language_code === 'fa');
            const tr = languages.find((l: any) => l.language_code === 'tr');
            setSelectedLanguage(fa?.language_code || tr?.language_code || languages[0].language_code);
        }
    }, [languages, selectedLanguage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const buildFilters = useCallback(() => {
        const filters: Record<string, any> = {
            search: debouncedSearch,
            translation_status: translationStatus,
            sort_by: sortBy,
            sort_direction: sortDirection
        };
        if (selectedType === 'bundle') {
            if (filterCompanyId) filters.filter_company_id = filterCompanyId;
            if (filterServiceId) filters.filter_service_id = filterServiceId;
            if (filterCategoryType) filters.filter_service_category_type = filterCategoryType;
            if (filterBundleType) filters.filter_bundle_type = filterBundleType;
            if (filterValidityType) filters.filter_validity_type = filterValidityType;
            if (filterCurrencyId) filters.filter_currency_id = filterCurrencyId;
            if (filterApiProviderId) filters.filter_api_provider_id = filterApiProviderId;
        }
        return filters;
    }, [
        debouncedSearch,
        translationStatus,
        sortBy,
        sortDirection,
        selectedType,
        filterCompanyId,
        filterServiceId,
        filterCategoryType,
        filterBundleType,
        filterValidityType,
        filterCurrencyId,
        filterApiProviderId
    ]);

    useEffect(() => {
        if (!selectedType || !selectedLanguage) return;
        dispatch(_fetchTranslationWorkspace(selectedType, selectedLanguage, page, perPage, buildFilters()));
    }, [dispatch, selectedType, selectedLanguage, page, perPage, buildFilters]);

    useEffect(() => {
        const params = new URLSearchParams();
        params.set('type', selectedType);
        if (selectedLanguage) params.set('language', selectedLanguage);
        router.replace(`/pages/translation-workspace?${params.toString()}`);
    }, [selectedType, selectedLanguage, router]);

    const hasDirtyRows = Object.keys(dirtyRows).length > 0;

    const applyType = (type: string) => {
        setSelectedType(type);
        setPage(1);
        dispatch(_resetTranslationDirty());
    };

    const applyLanguage = (lang: string) => {
        setSelectedLanguage(lang);
        setPage(1);
        dispatch(_resetTranslationDirty());
    };

    const requestLanguageChange = (lang: string) => {
        if (lang === selectedLanguage) return;
        if (hasDirtyRows) {
            setPendingType(null);
            setPendingLanguage(lang);
            setConfirmDialog(true);
            return;
        }
        applyLanguage(lang);
    };

    const requestTypeChange = (type: string) => {
        if (type === selectedType) return;
        if (hasDirtyRows) {
            setPendingLanguage(null);
            setPendingType(type);
            setConfirmDialog(true);
            return;
        }
        applyType(type);
    };

    const confirmDiscardAndContinue = () => {
        if (pendingType) applyType(pendingType);
        else if (pendingLanguage) applyLanguage(pendingLanguage);
        else {
            setPage(1);
            dispatch(_resetTranslationDirty());
        }
        setConfirmDialog(false);
        setPendingLanguage(null);
        setPendingType(null);
    };

    const hideConfirmDialog = () => {
        setConfirmDialog(false);
        setPendingLanguage(null);
        setPendingType(null);
    };

    const getRowValue = (item: TranslationItem, field: TranslationField) => {
        const dirty = dirtyRows[item.id];
        if (dirty && dirty[field.key] !== undefined) return dirty[field.key];
        return item.translation[field.key] ?? '';
    };

    const isRowDirty = (id: number) => !!dirtyRows[id];

    const onTranslationChange = (item: TranslationItem, field: TranslationField, value: string) => {
        dispatch(_markTranslationDirty(item.id, field.key, value));
    };

    const handleSaveChangedRows = async () => {
        if (!hasDirtyRows) {
            toast.current?.show({
                severity: 'info',
                summary: t('INFO'),
                detail: t('NO_CHANGES_TO_SAVE'),
                life: 3000
            });
            return;
        }

        const items = (Object.entries(dirtyRows) as Array<[string, Record<string, string>]>).map(([id, fields]) => ({
            id: Number(id),
            ...fields
        }));

        await dispatch(_bulkSaveTranslations(selectedType, selectedLanguage, items, toast, t));
        dispatch(_fetchTranslationWorkspace(selectedType, selectedLanguage, page, perPage, buildFilters()));
    };

    const clearBundleFilters = () => {
        setFilterCompanyId(null);
        setFilterServiceId(null);
        setFilterCategoryType(null);
        setFilterBundleType(null);
        setFilterValidityType(null);
        setFilterCurrencyId(null);
        setFilterApiProviderId(null);
        setPage(1);
    };

    const applyBundleFilters = () => {
        setPage(1);
        setFilterOpen(false);
    };

    const stats = workspace.statistics || { total: 0, missing: 0, translated: 0, partial: 0 };

    const filterChips: FilterChip[] = useMemo(() => {
        if (selectedType !== 'bundle') return [];
        const chips: FilterChip[] = [];
        if (filterCompanyId) {
            const company = (companies || []).find((c: any) => c.id === filterCompanyId);
            chips.push({ key: 'company', label: company?.company_name || String(filterCompanyId) });
        }
        if (filterServiceId) {
            const service = (services || []).find((s: any) => s.id === filterServiceId);
            chips.push({
                key: 'service',
                label: service
                    ? `${service.service_category?.category_name || ''} — ${service.company?.company_name || ''}`
                    : String(filterServiceId)
            });
        }
        if (filterCategoryType) chips.push({ key: 'category', label: filterCategoryType });
        if (filterBundleType) chips.push({ key: 'bundleType', label: filterBundleType });
        if (filterValidityType) chips.push({ key: 'validity', label: filterValidityType });
        if (filterCurrencyId) {
            const currency = (currencies || []).find((c: any) => c.id === filterCurrencyId);
            chips.push({ key: 'currency', label: currency?.name || String(filterCurrencyId) });
        }
        return chips;
    }, [
        selectedType,
        filterCompanyId,
        filterServiceId,
        filterCategoryType,
        filterBundleType,
        filterValidityType,
        filterCurrencyId,
        companies,
        services,
        currencies
    ]);

    const removeChip = (key: string) => {
        if (key === 'company') setFilterCompanyId(null);
        if (key === 'service') setFilterServiceId(null);
        if (key === 'category') setFilterCategoryType(null);
        if (key === 'bundleType') setFilterBundleType(null);
        if (key === 'validity') setFilterValidityType(null);
        if (key === 'currency') setFilterCurrencyId(null);
        setPage(1);
    };

    const statusBodyTemplate = (row: TranslationItem) => {
        const status = row.translation_status;
        const severity = status === 'translated' ? 'success' : status === 'partial' ? 'warning' : 'danger';
        return (
            <Tag
                value={t(status.toUpperCase())}
                severity={severity as any}
                icon={status === 'translated' ? 'pi pi-check' : status === 'partial' ? 'pi pi-clock' : 'pi pi-times'}
            />
        );
    };

    const renderContextColumns = () => {
        if (!workspace.items.length) return null;
        const contextKeys = Object.keys(workspace.items[0].context || {});
        return contextKeys.map((key) => (
            <Column
                key={key}
                field={`context.${key}`}
                header={t(key.toUpperCase())}
                body={(row: TranslationItem) => <span className="text-xs text-muted-foreground">{row.context[key] ?? '—'}</span>}
                style={{ ...customCellStyle }}
                headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
            />
        ));
    };

    const renderSourceColumn = (field: TranslationField) => (
        <Column
            key={`source-${field.key}`}
            header={`${field.label} (${t('ORIGINAL')})`}
            body={(row: TranslationItem) => <span className="text-xs text-muted-foreground">{row.source[field.key] ?? '—'}</span>}
            style={{ ...customCellStyle }}
            headerStyle={{ whiteSpace: 'nowrap', minWidth: '150px' }}
        />
    );

    const renderTranslationColumn = (field: TranslationField) => (
        <Column
            key={`trans-${field.key}`}
            header={`${field.label} (${workspace.language?.language_name || ''})`}
            body={(row: TranslationItem) => (
                <Input
                    value={getRowValue(row, field)}
                    onChange={(e) => onTranslationChange(row, field, e.target.value)}
                    placeholder={t('ENTER_TRANSLATION')}
                    className={cn('h-9 min-w-[12rem] text-sm', isRowDirty(row.id) && 'border-amber-500 ring-2 ring-amber-500/20')}
                    style={{ direction: (workspace.language?.direction as 'ltr' | 'rtl') || 'ltr' }}
                />
            )}
            style={{ ...customCellStyle }}
            headerStyle={{ whiteSpace: 'nowrap', minWidth: '200px' }}
        />
    );

    const description = [
        `${t('MANAGING')}: ${workspace.entity_label || selectedType}`,
        workspace.language ? `${t('LANGUAGE')}: ${workspace.language.language_name}` : null
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <>
            <Toast ref={toast} />
            <ListPage
                title={t('TRANSLATION_WORKSPACE')}
                description={description}
                loading={workspace.loading || bulkSave.loading}
                actions={
                    <Button type="button" disabled={!hasDirtyRows || bulkSave.loading} onClick={handleSaveChangedRows} className="gap-2">
                        <Save className="h-4 w-4" />
                        {bulkSave.loading ? t('SAVING', { defaultValue: 'در حال ذخیره…' }) : t('SAVE_CHANGED_ROWS')}
                    </Button>
                }
                toolbar={
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <StatCard label={t('TOTAL')} value={stats.total} icon={List} tone="slate" onClick={() => { setTranslationStatus('all'); setPage(1); }} />
                            <StatCard label={t('MISSING')} value={stats.missing} icon={AlertTriangle} tone="rose" onClick={() => { setTranslationStatus('missing'); setPage(1); }} />
                            <StatCard label={t('TRANSLATED')} value={stats.translated} icon={CheckCircle2} tone="primary" onClick={() => { setTranslationStatus('translated'); setPage(1); }} />
                            <StatCard label={t('PARTIAL')} value={stats.partial} icon={Clock3} tone="amber" onClick={() => { setTranslationStatus('partial'); setPage(1); }} />
                        </div>

                        <FilterBar
                            search={searchInput}
                            onSearchChange={setSearchInput}
                            searchPlaceholder={t('SEARCH')}
                            chips={filterChips}
                            onRemoveChip={removeChip}
                            onClearAll={selectedType === 'bundle' ? clearBundleFilters : undefined}
                            onOpenFilters={selectedType === 'bundle' ? () => setFilterOpen(true) : undefined}
                            extraActions={
                                <div className="flex flex-wrap items-center gap-2">
                                    <Select value={selectedType} onValueChange={requestTypeChange}>
                                        <SelectTrigger className="h-10 w-[10.5rem]">
                                            <SelectValue placeholder={t('CONTENT_TYPE')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(types || []).map((opt: any) => (
                                                <SelectItem key={opt.type} value={opt.type}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={selectedLanguage || undefined} onValueChange={requestLanguageChange}>
                                        <SelectTrigger className="h-10 w-[10.5rem]">
                                            <SelectValue placeholder={t('LANGUAGE')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {(languages || []).map((opt: any) => (
                                                <SelectItem key={opt.language_code} value={opt.language_code}>
                                                    {opt.language_name} ({opt.language_code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select
                                        value={translationStatus}
                                        onValueChange={(v) => {
                                            setTranslationStatus(v as typeof translationStatus);
                                            setPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="h-10 w-[9.5rem]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">{t('ALL')}</SelectItem>
                                            <SelectItem value="missing">{t('MISSING')}</SelectItem>
                                            <SelectItem value="partial">{t('PARTIAL')}</SelectItem>
                                            <SelectItem value="translated">{t('TRANSLATED')}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            }
                        />
                    </div>
                }
                footer={
                    workspace.pagination ? (
                        <div className="border-t border-slate-200 px-2 py-2">
                            <Paginator
                                first={(workspace.pagination.page - 1) * workspace.pagination.items_per_page}
                                rows={workspace.pagination.items_per_page}
                                totalRecords={workspace.pagination.total}
                                onPageChange={(e) => {
                                    setPage(e.page + 1);
                                    setPerPage(e.rows);
                                }}
                                template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate={t('SHOWING_PAGE_INFO')}
                                firstPageLinkIcon={isRTL() ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'}
                                lastPageLinkIcon={isRTL() ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'}
                            />
                        </div>
                    ) : null
                }
            >
                <DataTable
                    value={workspace.items}
                    dataKey="id"
                    className="datatable-responsive"
                    emptyMessage={t('NO_DATA')}
                    dir={isRTL() ? 'rtl' : 'ltr'}
                    style={{
                        direction: isRTL() ? 'rtl' : 'ltr',
                        fontFamily: "'iranyekan', sans-serif"
                    }}
                    scrollable
                    responsiveLayout="scroll"
                    paginator={false}
                >
                    <Column
                        header={t('ID')}
                        field="id"
                        body={(row: TranslationItem) => <span className="font-semibold">{row.id}</span>}
                        style={{ ...customCellStyle }}
                        headerStyle={{ minWidth: '70px' }}
                    />
                    {renderContextColumns()}
                    {workspace.fields.map((f: TranslationField) => renderSourceColumn(f))}
                    {workspace.fields.map((f: TranslationField) => renderTranslationColumn(f))}
                    <Column header={t('STATUS')} body={statusBodyTemplate} style={{ ...customCellStyle }} headerStyle={{ minWidth: '120px' }} />
                </DataTable>
            </ListPage>

            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                <SheetContent side="left" className="w-full sm:max-w-md">
                    <SheetHeader>
                        <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر ترجمه بسته‌ها' })}</SheetTitle>
                        <SheetDescription>
                            {t('PAYMENT.FILTER.HINT', { defaultValue: 'فیلترها روی نتایج سرور اعمال می‌شوند.' })}
                        </SheetDescription>
                    </SheetHeader>
                    <div className={FILTER_SHEET_BODY_CLASS}>
                        <FormField label={t('COMPANY')}>
                            <Select
                                value={filterCompanyId ? String(filterCompanyId) : undefined}
                                onValueChange={(v) => setFilterCompanyId(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_COMPANY')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(companies || []).map((c: any) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('SERVICE')}>
                            <Select
                                value={filterServiceId ? String(filterServiceId) : undefined}
                                onValueChange={(v) => setFilterServiceId(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_SERVICE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(services || []).map((s: any) => (
                                        <SelectItem key={s.id} value={String(s.id)}>
                                            {s.service_category?.category_name} — {s.company?.company_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('CATEGORY_TYPE')}>
                            <Select value={filterCategoryType || undefined} onValueChange={setFilterCategoryType}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_TYPE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="social">{t('ORDER.FILTER.SOCIAL', { defaultValue: 'اجتماعی' })}</SelectItem>
                                    <SelectItem value="nonsocial">{t('ORDER.FILTER.NONSOCIAL', { defaultValue: 'غیر اجتماعی' })}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('BUNDLE_TYPE')}>
                            <Select value={filterBundleType || undefined} onValueChange={setFilterBundleType}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_TYPE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="credit">{t('CREDIT', { defaultValue: 'اعتبار' })}</SelectItem>
                                    <SelectItem value="package">{t('PACKAGE', { defaultValue: 'بسته' })}</SelectItem>
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('VALIDITY_TYPE')}>
                            <Select value={filterValidityType || undefined} onValueChange={setFilterValidityType}>
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_TYPE')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {['unlimited', 'daily', 'nightly', 'weekly', 'monthly', 'yearly'].map((v) => (
                                        <SelectItem key={v} value={v}>
                                            {v}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label={t('CURRENCY')}>
                            <Select
                                value={filterCurrencyId ? String(filterCurrencyId) : undefined}
                                onValueChange={(v) => setFilterCurrencyId(Number(v))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('SELECT_CURRENCY')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {(currencies || []).map((c: any) => (
                                        <SelectItem key={c.id} value={String(c.id)}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <div className="flex gap-2 pt-2">
                            <Button type="button" variant="outline" className="flex-1" onClick={clearBundleFilters}>
                                {t('RESET', { defaultValue: 'بازنشانی' })}
                            </Button>
                            <Button type="button" className="flex-1" onClick={applyBundleFilters}>
                                {t('APPLY', { defaultValue: 'اعمال' })}
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>

            <Dialog
                visible={confirmDialog}
                style={{ width: '450px' }}
                header={t('CONFIRM')}
                modal
                footer={
                    <>
                        <PrimeButton label={t('CANCEL')} icon="pi pi-times" severity="secondary" onClick={hideConfirmDialog} />
                        <PrimeButton label={t('DISCARD_AND_CONTINUE')} icon="pi pi-check" severity="danger" onClick={confirmDiscardAndContinue} />
                    </>
                }
                onHide={hideConfirmDialog}
            >
                <div className="flex items-center justify-center gap-3">
                    <i className="pi pi-exclamation-triangle me-0 text-[2rem] text-amber-500" />
                    <span className="text-start">{t('UNSAVED_CHANGES_WARNING')}</span>
                </div>
            </Dialog>
        </>
    );
};

export default withAuth(TranslationWorkspacePage);
