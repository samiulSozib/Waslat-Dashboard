/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Paginator } from 'primereact/paginator';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Tag } from 'primereact/tag';
import { classNames } from 'primereact/utils';

import { AppDispatch } from '@/app/redux/store';


import {
  _fetchTranslationLanguages,
  _fetchTranslationTypes,
  _fetchTranslationWorkspace,
  _markTranslationDirty,
  _clearTranslationDirty,
  _resetTranslationDirty,
  _bulkSaveTranslations,
} from '@/app/redux/actions/translationActions';

import { _fetchCompanies } from '@/app/redux/actions/companyActions';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';

import {
  TranslationField,
  TranslationItem,
} from '@/types/translation';
import { customCellStyle } from '@/app/(main)/utilities/customRow';
import { isRTL } from '@/app/(main)/utilities/rtlUtil';
import withAuth from '@/app/(main)/authGuard';

/* ------------------------------------------------------------------ */
/* Translation Workspace Page                                          */
/* ------------------------------------------------------------------ */
const TranslationWorkspacePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const toast = useRef<Toast>(null);

  /* ---------------------- URL-driven state ---------------------- */
  const initialType = searchParams.get('type') || 'bundle';
  const initialLang = searchParams.get('language') || '';

  const [selectedType, setSelectedType] = useState<string>(initialType);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);

  /* ---------------------- UI state ---------------------- */
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [translationStatus, setTranslationStatus] = useState<
    'all' | 'missing' | 'partial' | 'translated'
  >('all');

  const [sortBy, setSortBy] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Bundle-specific filters
  const [filterCompanyId, setFilterCompanyId] = useState<number | null>(null);
  const [filterServiceId, setFilterServiceId] = useState<number | null>(null);
  const [filterCategoryType, setFilterCategoryType] = useState<string | null>(null);
  const [filterBundleType, setFilterBundleType] = useState<string | null>(null);
  const [filterValidityType, setFilterValidityType] = useState<string | null>(null);
  const [filterCurrencyId, setFilterCurrencyId] = useState<number | null>(null);
  const [filterApiProviderId, setFilterApiProviderId] = useState<number | null>(null);

  const [filterDialogVisible, setFilterDialogVisible] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const [languageChangeDialog, setLanguageChangeDialog] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);

  /* ---------------------- Redux state ---------------------- */
  const {
    languages,
    types,
    workspace,
    dirtyRows,
    bulkSave,
  } = useSelector((state: any) => state.translationReducer);

  const { companies } = useSelector((state: any) => state.companyReducer);
  const { services } = useSelector((state: any) => state.serviceReducer);
  const { currencies } = useSelector((state: any) => state.currenciesReducer);

  /* ---------------------- Initial data ---------------------- */
  useEffect(() => {
    dispatch(_fetchTranslationLanguages());
    dispatch(_fetchTranslationTypes());
    dispatch(_fetchCompanies());
    dispatch(_fetchServiceList());
    dispatch(_fetchCurrencies());
  }, [dispatch]);

  /* ---------------------- Auto-select language ---------------------- */
  useEffect(() => {
    if (!selectedLanguage && languages.length > 0) {
      // Default to Turkish (tr) if available, otherwise first language
      const tr = languages.find((l: any) => l.language_code === 'tr');
      setSelectedLanguage(tr?.language_code || languages[0].language_code);
    }
  }, [languages, selectedLanguage]);

  /* ---------------------- Debounced search ---------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  /* ---------------------- Fetch workspace ---------------------- */
  const buildFilters = useCallback(() => {
    const filters: Record<string, any> = {
      search: debouncedSearch,
      translation_status: translationStatus,
      sort_by: sortBy,
      sort_direction: sortDirection,
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
    filterApiProviderId,
  ]);

  useEffect(() => {
    if (!selectedType || !selectedLanguage) return;
    dispatch(
      _fetchTranslationWorkspace(
        selectedType,
        selectedLanguage,
        page,
        perPage,
        buildFilters()
      )
    );
  }, [dispatch, selectedType, selectedLanguage, page, perPage, buildFilters]);

  /* ---------------------- Sync URL ---------------------- */
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('type', selectedType);
    if (selectedLanguage) params.set('language', selectedLanguage);
    router.replace(`/pages/translation-workspace?${params.toString()}`);
  }, [selectedType, selectedLanguage, router]);

  /* ---------------------- Unsaved changes guard ---------------------- */
  const hasDirtyRows = Object.keys(dirtyRows).length > 0;

  const requestLanguageChange = (lang: string) => {
    if (lang === selectedLanguage) return;
    if (hasDirtyRows) {
      setPendingLanguage(lang);
      setLanguageChangeDialog(true);
    } else {
      setSelectedLanguage(lang);
      setPage(1);
      dispatch(_resetTranslationDirty());
    }
  };

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      setSelectedLanguage(pendingLanguage);
      setPage(1);
      dispatch(_resetTranslationDirty());
    }
    setLanguageChangeDialog(false);
    setPendingLanguage(null);
  };

  /* ---------------------- Type change ---------------------- */
  const requestTypeChange = (type: string) => {
    if (type === selectedType) return;
    if (hasDirtyRows) {
      setPendingLanguage(null);
      setLanguageChangeDialog(true);
      // reuse dialog: we just want to confirm discard
      setPendingLanguage(selectedLanguage); // will be re-set after confirm
    }
    setSelectedType(type);
    setPage(1);
    dispatch(_resetTranslationDirty());
  };

  /* ---------------------- Dirty helpers ---------------------- */
  const getRowValue = (item: TranslationItem, field: TranslationField) => {
    const dirty = dirtyRows[item.id];
    if (dirty && dirty[field.key] !== undefined) return dirty[field.key];
    return item.translation[field.key] ?? '';
  };

  const isRowDirty = (id: number) => !!dirtyRows[id];

  const onTranslationChange = (
    item: TranslationItem,
    field: TranslationField,
    value: string
  ) => {
    dispatch(_markTranslationDirty(item.id, field.key, value));
  };

  /* ---------------------- Bulk save ---------------------- */
  const handleSaveChangedRows = async () => {
    if (!hasDirtyRows) {
      toast.current?.show({
        severity: 'info',
        summary: t('INFO'),
        detail: t('NO_CHANGES_TO_SAVE'),
        life: 3000,
      });
      return;
    }

const items = (
  Object.entries(dirtyRows) as Array<[string, Record<string, string>]>
).map(([id, fields]) => ({
  id: Number(id),
  ...fields,
}));

    await dispatch(
      _bulkSaveTranslations(selectedType, selectedLanguage, items, toast, t)
    );

    // refresh page after save
    dispatch(
      _fetchTranslationWorkspace(
        selectedType,
        selectedLanguage,
        page,
        perPage,
        buildFilters()
      )
    );
  };

  /* ---------------------- Outside-click filter ---------------------- */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.p-dropdown-panel')) return;
      if (
        filterDialogVisible &&
        filterRef.current &&
        !filterRef.current.contains(target)
      ) {
        setFilterDialogVisible(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterDialogVisible]);

  /* ---------------------- Statistics cards ---------------------- */
  const stats = workspace.statistics || {
    total: 0,
    missing: 0,
    translated: 0,
    partial: 0,
  };

  const statsCards = [
    { label: t('TOTAL'), value: stats.total, icon: 'pi pi-list', cls: 'blue' },
    { label: t('MISSING'), value: stats.missing, icon: 'pi pi-exclamation-triangle', cls: 'red' },
    { label: t('TRANSLATED'), value: stats.translated, icon: 'pi pi-check-circle', cls: 'green' },
    { label: t('PARTIAL'), value: stats.partial, icon: 'pi pi-clock', cls: 'orange' },
  ];

  /* ---------------------- Status badge ---------------------- */
  const statusBodyTemplate = (row: TranslationItem) => {
    const status = row.translation_status;
    const severity =
      status === 'translated'
        ? 'success'
        : status === 'partial'
        ? 'warning'
        : 'danger';
    return (
      <Tag
        value={t(status.toUpperCase())}
        severity={severity as any}
        icon={
          status === 'translated'
            ? 'pi pi-check'
            : status === 'partial'
            ? 'pi pi-clock'
            : 'pi pi-times'
        }
      />
    );
  };

  /* ---------------------- Context columns ---------------------- */
  // For bundle, show company / service; for others, show whatever context keys exist
  const renderContextColumns = () => {
    if (!workspace.items.length) return null;
    const contextKeys = Object.keys(workspace.items[0].context || {});
    return contextKeys.map((key) => (
      <Column
        key={key}
        field={`context.${key}`}
        header={t(key.toUpperCase())}
        body={(row: TranslationItem) => (
          <span style={{ fontSize: '0.8rem', color: '#666' }}>
            {row.context[key] ?? '-'}
          </span>
        )}
        style={{ ...customCellStyle }}
        headerStyle={{ whiteSpace: 'nowrap', minWidth: '100px' }}
      />
    ));
  };

  /* ---------------------- Dynamic translation columns ---------------------- */
  const renderSourceColumn = (field: TranslationField) => (
    <Column
      key={`source-${field.key}`}
      header={`${field.label} (${t('ORIGINAL')})`}
      body={(row: TranslationItem) => (
        <span style={{ fontSize: '0.8rem', color: '#666' }}>
          {row.source[field.key] ?? '-'}
        </span>
      )}
      style={{ ...customCellStyle }}
      headerStyle={{ whiteSpace: 'nowrap', minWidth: '150px' }}
    />
  );

  const renderTranslationColumn = (field: TranslationField) => (
    <Column
      key={`trans-${field.key}`}
      header={`${field.label} (${workspace.language?.language_name || ''})`}
      body={(row: TranslationItem) => (
        <InputText
          value={getRowValue(row, field)}
          onChange={(e) => onTranslationChange(row, field, e.target.value)}
          placeholder={t('ENTER_TRANSLATION')}
          className={classNames('w-full', {
            'border-yellow-500': isRowDirty(row.id),
          })}
          style={{
            fontSize: '0.85rem',
            direction: workspace.language?.direction || 'ltr',
          }}
        />
      )}
      style={{ ...customCellStyle }}
      headerStyle={{ whiteSpace: 'nowrap', minWidth: '200px' }}
    />
  );

  /* ---------------------- Toolbar ---------------------- */
  const leftToolbarTemplate = () => (
    <div className="flex align-items-center gap-2 flex-wrap">
      {/* Content type */}
      <Dropdown
        value={selectedType}
        options={types}
        onChange={(e) => requestTypeChange(e.value)}
        optionLabel="label"
        optionValue="type"
        placeholder={t('CONTENT_TYPE')}
        className="min-w-[180px]"
      />

      {/* Language */}
      <Dropdown
        value={selectedLanguage}
        options={languages}
        onChange={(e) => requestLanguageChange(e.value)}
        optionLabel="language_name"
        optionValue="language_code"
        placeholder={t('LANGUAGE')}
        className="min-w-[160px]"
        itemTemplate={(opt: any) => (
          <div className="flex align-items-center gap-2">
            <span>{opt.language_name}</span>
            <span className="text-xs text-gray-500">({opt.language_code})</span>
          </div>
        )}
      />

      {/* Search */}
      <span className="p-input-icon-left">
        <i className="pi pi-search" />
        <InputText
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t('SEARCH')}
          className="min-w-[220px]"
        />
      </span>

      {/* Filter (only for bundle for now) */}
      {selectedType === 'bundle' && (
        <div ref={filterRef} style={{ position: 'relative' }}>
          <Button
            label={t('FILTER')}
            icon="pi pi-filter"
            className="p-button-info"
            onClick={() => setFilterDialogVisible(!filterDialogVisible)}
          />
          {filterDialogVisible && (
            <div
              className="p-card p-fluid"
              style={{
                position: 'absolute',
                top: '100%',
                left: isRTL() ? '-100%' : '-20%',
                right: isRTL() ? '-20%' : '-100%',
                width: '320px',
                zIndex: 1000,
                marginTop: '0.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <div className="p-card-body" style={{ padding: '1rem' }}>
                <div className="grid">
                  <div className="col-12">
                    <label>{t('COMPANY')}</label>
                    <Dropdown
                      value={filterCompanyId}
                      options={companies}
                      onChange={(e) => setFilterCompanyId(e.value)}
                      optionLabel="company_name"
                      optionValue="id"
                      showClear
                      placeholder={t('SELECT_COMPANY')}
                      className="w-full"
                    />
                  </div>
                  <div className="col-12">
                    <label>{t('SERVICE')}</label>
                    <Dropdown
                      value={services.find((s: any) => s.id === filterServiceId) || null}
                      options={services}
                      onChange={(e) => setFilterServiceId(e.value?.id || null)}
                      optionLabel="company.company_name"
                      showClear
                      placeholder={t('SELECT_SERVICE')}
                      className="w-full"
                      itemTemplate={(opt: any) => (
                        <div className="flex gap-1">
                          <span>{opt.service_category?.category_name}</span>
                          <span>- {opt.company?.company_name}</span>
                        </div>
                      )}
                    />
                  </div>
                  <div className="col-12">
                    <label>{t('CATEGORY_TYPE')}</label>
                    <Dropdown
                      value={filterCategoryType}
                      options={[
                        { label: 'Social', value: 'social' },
                        { label: 'Non-Social', value: 'nonsocial' },
                      ]}
                      onChange={(e) => setFilterCategoryType(e.value)}
                      showClear
                      placeholder={t('SELECT_TYPE')}
                      className="w-full"
                    />
                  </div>
                  <div className="col-12">
                    <label>{t('BUNDLE_TYPE')}</label>
                    <Dropdown
                      value={filterBundleType}
                      options={[
                        { label: 'Credit', value: 'credit' },
                        { label: 'Package', value: 'package' },
                      ]}
                      onChange={(e) => setFilterBundleType(e.value)}
                      showClear
                      placeholder={t('SELECT_TYPE')}
                      className="w-full"
                    />
                  </div>
                  <div className="col-12">
                    <label>{t('VALIDITY_TYPE')}</label>
                    <Dropdown
                      value={filterValidityType}
                      options={[
                        'unlimited',
                        'daily',
                        'nightly',
                        'weekly',
                        'monthly',
                        'yearly',
                      ].map((v) => ({ label: v, value: v }))}
                      onChange={(e) => setFilterValidityType(e.value)}
                      showClear
                      placeholder={t('SELECT_TYPE')}
                      className="w-full"
                    />
                  </div>
                  <div className="col-12">
                    <label>{t('CURRENCY')}</label>
                    <Dropdown                      value={filterCurrencyId}
                      options={currencies}
                      onChange={(e) => setFilterCurrencyId(e.value)}
                      optionLabel="name"
                      optionValue="id"
                      showClear
                      placeholder={t('SELECT_CURRENCY')}
                      className="w-full"
                    />
                  </div>
                  <div className="col-12 mt-3 flex justify-content-between gap-2">
                    <Button
                      label={t('RESET')}
                      icon="pi pi-times"
                      className="p-button-secondary p-button-sm"
                      onClick={() => {
                        setFilterCompanyId(null);
                        setFilterServiceId(null);
                        setFilterCategoryType(null);
                        setFilterBundleType(null);
                        setFilterValidityType(null);
                        setFilterCurrencyId(null);
                        setFilterApiProviderId(null);
                        setPage(1);
                      }}
                    />
                    <Button
                      label={t('APPLY')}
                      icon="pi pi-check"
                      className="p-button-sm"
                      onClick={() => {
                        setPage(1);
                        setFilterDialogVisible(false);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status filter */}
      <Dropdown
        value={translationStatus}
        options={[
          { label: t('ALL'), value: 'all' },
          { label: t('MISSING'), value: 'missing' },
          { label: t('PARTIAL'), value: 'partial' },
          { label: t('TRANSLATED'), value: 'translated' },
        ]}
        onChange={(e) => {
          setTranslationStatus(e.value);
          setPage(1);
        }}
        className="min-w-[160px]"
      />
    </div>
  );

  const rightToolbarTemplate = () => (
    <div className="flex align-items-center gap-2">
      <Button
        label={t('SAVE_CHANGED_ROWS')}
        icon="pi pi-save"
        severity="success"
        disabled={!hasDirtyRows || bulkSave.loading}
        loading={bulkSave.loading}
        onClick={handleSaveChangedRows}
      />
    </div>
  );

  /* ---------------------- Render ---------------------- */
  return (
    <div className="grid crud-demo -m-5">
      <div className="col-12">
        <div className="card p-2">
          {(workspace.loading || bulkSave.loading) && (
            <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
          )}
          <Toast ref={toast} />

          {/* Header */}
          <div className="mb-3">
            <h2 className="m-0">{t('TRANSLATION_WORKSPACE')}</h2>
            <p className="text-gray-500 mt-1 mb-0">
              {t('MANAGING')}: <b>{workspace.entity_label || selectedType}</b>
              {workspace.language && (
                <>
                  {' '}| {t('LANGUAGE')}: <b>{workspace.language.language_name}</b>
                </>
              )}
            </p>
          </div>

          {/* Statistics cards */}
          <div className="grid mb-3">
            {statsCards.map((c) => (
              <div className="col-12 md:col-3" key={c.label}>
                <div
                  className={`p-3 border-round shadow-1 bg-${c.cls}-50`}
                  style={{ border: `1px solid var(--${c.cls}-200)` }}
                >
                  <div className="flex align-items-center justify-content-between">
                    <div>
                      <div className="text-sm text-gray-600">{c.label}</div>
                      <div className="text-2xl font-bold">{c.value}</div>
                    </div>
                    <i className={`${c.icon} text-3xl text-${c.cls}-500`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Toolbar */}
          <Toolbar
            className="mb-4"
            left={leftToolbarTemplate}
            right={rightToolbarTemplate}
          />

          {/* Table */}
          <DataTable
            value={workspace.items}
            dataKey="id"
            className="datatable-responsive"
            emptyMessage={t('NO_DATA')}
            dir={isRTL() ? 'rtl' : 'ltr'}
            style={{
              direction: isRTL() ? 'rtl' : 'ltr',
              fontFamily: "'iranyekan', sans-serif,iranyekan",
            }}
            scrollable
            scrollHeight="flex"
            responsiveLayout="scroll"
            paginator={false}
          >
            <Column
              header={t('ID')}
              field="id"
              body={(row: TranslationItem) => (
                <span className="font-semibold">{row.id}</span>
              )}
              style={{ ...customCellStyle }}
              headerStyle={{ minWidth: '70px' }}
            />

            {/* Context columns (dynamic per type) */}
            {renderContextColumns()}

            {/* Source columns (dynamic per type) */}
            {workspace.fields.map((f: TranslationField) => renderSourceColumn(f))}

            {/* Translation columns (dynamic per type) */}
            {workspace.fields.map((f: TranslationField) =>
              renderTranslationColumn(f)
            )}

            {/* Status */}
            <Column
              header={t('STATUS')}
              body={statusBodyTemplate}
              style={{ ...customCellStyle }}
              headerStyle={{ minWidth: '120px' }}
            />
          </DataTable>

          {/* Pagination */}
          {workspace.pagination && (
            <Paginator
              first={
                (workspace.pagination.page - 1) *
                workspace.pagination.items_per_page
              }
              rows={workspace.pagination.items_per_page}
              totalRecords={workspace.pagination.total}
              onPageChange={(e) => {
                const newPage = e.page + 1;
                setPage(newPage);
                setPerPage(e.rows);
              }}
              template={
                isRTL()
                  ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
                  : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
              }
              currentPageReportTemplate={t('SHOWING_PAGE_INFO')}
              firstPageLinkIcon={
                isRTL() ? 'pi pi-angle-double-right' : 'pi pi-angle-double-left'
              }
              lastPageLinkIcon={
                isRTL() ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right'
              }
            />
          )}

          {/* Unsaved-changes confirmation dialog */}
          <Dialog
            visible={languageChangeDialog}
            style={{ width: '450px' }}
            header={t('CONFIRM')}
            modal
            footer={
              <>
                <Button
                  label={t('CANCEL')}
                  icon="pi pi-times"
                  severity="secondary"
                  onClick={() => {
                    setLanguageChangeDialog(false);
                    setPendingLanguage(null);
                  }}
                />
                <Button
                  label={t('DISCARD_AND_CONTINUE')}
                  icon="pi pi-check"
                  severity="danger"
                  onClick={() => {
                    if (pendingLanguage) {
                      setSelectedLanguage(pendingLanguage);
                    }
                    setPage(1);
                    dispatch(_resetTranslationDirty());
                    setLanguageChangeDialog(false);
                    setPendingLanguage(null);
                  }}
                />
              </>
            }
            onHide={() => {
              setLanguageChangeDialog(false);
              setPendingLanguage(null);
            }}
          >
            <div className="flex align-items-center justify-content-center">
              <i
                className="pi pi-exclamation-triangle mr-3"
                style={{ fontSize: '2rem', color: 'orange' }}
              />
              <span>{t('UNSAVED_CHANGES_WARNING')}</span>
            </div>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default withAuth(TranslationWorkspacePage);
