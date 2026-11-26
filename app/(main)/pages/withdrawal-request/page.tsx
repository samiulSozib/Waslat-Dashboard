/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import { Currency, Reseller, WithdrawRequest } from '@/types/interface';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../utilities/rtlUtil';
import { FormActions, FormField, FormSection, FormSheet } from '@/components/admin/form-sheet';
import { SearchSelect } from '@/components/admin/search-select';
import { ListPage } from '@/components/admin/list-page';
import { FilterBar } from '@/components/admin/filter-bar';
import { FilterField, FILTER_SHEET_BODY_CLASS } from '@/components/admin/filter-field';
import { RowActions } from '@/components/admin/row-actions';
import { Button as UiButton } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { CheckCircle, Plus, XCircle } from 'lucide-react';
import { _fetchCurrencies } from '@/app/redux/actions/currenciesActions';
import { _fetchResellers } from '@/app/redux/actions/resellerActions';
import { clearWithdrawFilters, createWithdrawRequest, fetchWithdrawRequests, setWithdrawFilters, updateWithdrawStatus } from '@/app/redux/actions/withdrawalRequestActions';

// Define the WithdrawRequestCreate type for the dialog
interface WithdrawRequestCreate {
  reseller_id: number;
  currency_id: number;
  amount: number;
  net_amount?: number;
  commission_amount?: number;
  admin_note?: string;
  bank_details?: {
    bank_name?: string;
    account_holder_name?: string;
    account_number?: string;
    iban?: string;
    branch?: string;
    swift_code?: string;
  };
}

const WithdrawRequestsPage = () => {
  let emptyWithdrawRequest: WithdrawRequestCreate = {
    reseller_id: 0,
    currency_id: 0,
    amount: 0,
    net_amount: 0,
    commission_amount: 0,
    bank_details: {
      bank_name: '',
      account_holder_name: '',
      account_number: '',
      iban: '',
      branch: '',
      swift_code: ''
    }
  };

  const [withdrawRequestDialog, setWithdrawRequestDialog] = useState(false);
  const [statusUpdateDialog, setStatusUpdateDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [withdrawRequest, setWithdrawRequest] = useState<WithdrawRequestCreate>(emptyWithdrawRequest);
  const [selectedWithdrawRequests, setSelectedWithdrawRequests] = useState<WithdrawRequest[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const searchTag = useDebouncedValue(searchInput, 350);
  const [filterOpen, setFilterOpen] = useState(false);
  const [draftStatusFilter, setDraftStatusFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [adminNote, setAdminNote] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [draftDateRange, setDraftDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedResellerCurrency, setSelectedResellerCurrency] = useState<Currency | null>(null);
  
  const toast = useRef<Toast>(null);
  const dispatch = useDispatch<AppDispatch>();
  
  // Get state from redux
  const { withdrawRequests, loading, pagination, filters } = useSelector(
    (state: any) => state.withdrawRequestsReducer
  );
  
  const { currencies } = useSelector((state: any) => state.currenciesReducer);
  const { resellers } = useSelector((state: any) => state.resellerReducer);
  
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchWithdrawRequests(1, filters));
    dispatch(_fetchCurrencies());
    dispatch(_fetchResellers());
  }, [dispatch, filters]);

  useEffect(() => {
    // Apply filters when status changes
    if (statusFilter !== undefined) {
      dispatch(setWithdrawFilters({ status: statusFilter }));
    }
  }, [statusFilter, dispatch]);

  useEffect(() => {
    // Apply date range filter
    if (dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].toISOString().split('T')[0];
      const endDate = dateRange[1].toISOString().split('T')[0];
      dispatch(setWithdrawFilters({ 
        start_date: startDate, 
        end_date: endDate 
      }));
    } else if (!dateRange[0] && !dateRange[1]) {
      // Clear date filters if both are null
      const { start_date, end_date, ...restFilters } = filters;
      dispatch(setWithdrawFilters(restFilters));
    }
  }, [dateRange, dispatch]);

  const openNew = () => {
    setWithdrawRequest(emptyWithdrawRequest);
    setSelectedResellerCurrency(null);
    setSubmitted(false);
    setWithdrawRequestDialog(true);
  };

  const hideDialog = () => {
    setSubmitted(false);
    setWithdrawRequestDialog(false);
    setSelectedResellerCurrency(null);
  };

  const hideStatusUpdateDialog = () => {
    setStatusUpdateDialog(false);
    setSelectedRequest(null);
    setAdminNote('');
  };

  // Find currency by code
  const findCurrencyByCode = (code: string): Currency | null => {
    return currencies.find((currency: Currency) => 
      currency.code?.toUpperCase() === code?.toUpperCase()
    ) || null;
  };

  // Handle reseller change to populate account details and auto-select currency
  const handleResellerChange = (resellerId: number) => {
    const selectedReseller = resellers.find((r: Reseller) => r.id === resellerId);
    if (selectedReseller) {
      // Find the currency based on reseller's code
      const resellerCode = selectedReseller.code; // Assuming reseller has code attribute
      let currency: Currency | null = null;
      
      if (resellerCode) {
        currency = findCurrencyByCode(resellerCode);
      }
      
      // If currency not found by code, try to find by country currency (based on your API structure)
      if (!currency && selectedReseller.country?.currency_id) {
        currency = currencies.find((c: Currency) => c.id === Number(selectedReseller.country?.currency_id));
      }
      
      setSelectedResellerCurrency(currency);
      
      setWithdrawRequest(prev => ({
        ...prev,
        reseller_id: resellerId,
        currency_id: currency?.id || 0,
        bank_details: {
          ...prev.bank_details,
          account_holder_name: selectedReseller.reseller_name || selectedReseller.contact_name || ''
        }
      }));
    } else {
      setSelectedResellerCurrency(null);
      setWithdrawRequest(prev => ({
        ...prev,
        reseller_id: 0,
        currency_id: 0,
        bank_details: {
          ...prev.bank_details,
          account_holder_name: ''
        }
      }));
    }
  };

  const saveWithdrawRequest = () => {
    setSubmitted(true);

    // Validation
    if (!withdrawRequest.reseller_id ||
        !withdrawRequest.currency_id ||
        !withdrawRequest.amount ||
        !withdrawRequest.bank_details?.bank_name ||
        !withdrawRequest.bank_details?.account_holder_name ||
        !withdrawRequest.bank_details?.account_number) {
      toast.current?.show({
        severity: 'error',
        summary: t('ERROR'),
        detail: t('PLEASE_FILL_ALL_REQUIRED_FIELDS'),
        life: 3000
      });
      return;
    }

    if (withdrawRequest.amount <= 0) {
      toast.current?.show({
        severity: 'error',
        summary: t('ERROR'),
        detail: t('AMOUNT_MUST_BE_GREATER_THAN_ZERO'),
        life: 3000
      });
      return;
    }

    // Prepare data for API
    const requestData = {
      reseller_id: withdrawRequest.reseller_id,
      currency_id: withdrawRequest.currency_id,
      amount: withdrawRequest.amount,
      net_amount: withdrawRequest.net_amount || withdrawRequest.amount,
      commission_amount: withdrawRequest.commission_amount || 0,
      admin_note: withdrawRequest.admin_note,
      bank_details: withdrawRequest.bank_details
    };

    dispatch(createWithdrawRequest(
      requestData,
      toast,
      t,
      () => {
        setWithdrawRequestDialog(false);
        setWithdrawRequest(emptyWithdrawRequest);
        setSelectedResellerCurrency(null);
        dispatch(fetchWithdrawRequests(1, filters));
      }
    ));
  };

  const handleStatusUpdate = (status: number) => {
    if (!selectedRequest) return;

    // Map status numbers to string values
    const statusString = status == 1 ? 'approved' : 'rejected';

    dispatch(updateWithdrawStatus(
      selectedRequest.id,
      statusString, 
      adminNote,
      toast,
      t,
      () => {
        hideStatusUpdateDialog();
        dispatch(fetchWithdrawRequests(1, filters));
      }
    ));
  };

  const confirmStatusUpdate = (request: WithdrawRequest, status: number) => {
    setSelectedRequest(request);
    setAdminNote(request.admin_note || '');
    setStatusUpdateDialog(true);
  };

  const filteredWithdrawRequests = useMemo(() => {
    const search = searchTag.trim().toLocaleLowerCase();
    const list = withdrawRequests || [];
    if (!search) return list;
    return list.filter((row: WithdrawRequest) =>
      [
        row.reseller?.reseller_name,
        row.reseller?.email,
        row.currency?.code,
        row.bank_details?.bank_name,
        row.bank_details?.account_number,
        row.status,
        row.amount
      ]
        .filter((v) => v !== null && v !== undefined)
        .join(' ')
        .toLocaleLowerCase()
        .includes(search)
    );
  }, [withdrawRequests, searchTag]);

  const chips = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    if (statusFilter) list.push({ key: 'status', label: `${t('STATUS')}: ${statusFilter}` });
    if (dateRange[0] && dateRange[1]) {
      list.push({
        key: 'dates',
        label: `${t('DATE')}: ${dateRange[0].toISOString().split('T')[0]} — ${dateRange[1].toISOString().split('T')[0]}`
      });
    }
    return list;
  }, [statusFilter, dateRange, t]);

  const applyFilters = () => {
    setStatusFilter(draftStatusFilter);
    setDateRange(draftDateRange);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setDraftStatusFilter('');
    setDraftDateRange([null, null]);
    setStatusFilter('');
    setDateRange([null, null]);
    dispatch(clearWithdrawFilters());
    setFilterOpen(false);
  };

  const removeChip = (key: string) => {
    if (key === 'status') setStatusFilter('');
    if (key === 'dates') setDateRange([null, null]);
  };

  const totalPages = Math.max(1, Math.ceil((pagination?.total || 0) / (pagination?.items_per_page || 10)));

  const onPageChange = (page: number) => {
    dispatch(fetchWithdrawRequests(page, filters));
  };

  const withdrawStatusVariant = (status?: string): 'success' | 'warning' | 'danger' | 'muted' => {
    const s = status?.toString().toLowerCase();
    if (s === 'approved') return 'success';
    if (s === 'pending') return 'warning';
    if (s === 'rejected') return 'danger';
    return 'muted';
  };

  const getWithdrawRowActions = (row: WithdrawRequest) => {
    if ((row.status?.toString() || 'pending') !== 'pending') return [];
    return [
      { label: t('APPROVE'), icon: <CheckCircle className="h-4 w-4" />, onClick: () => confirmStatusUpdate(row, 1) },
      { label: t('REJECT'), icon: <XCircle className="h-4 w-4" />, onClick: () => confirmStatusUpdate(row, 2), danger: true }
    ];
  };

  const statusUpdateDialogFooter = (
    <>
      <Button 
        label={t('CANCEL')} 
        icon="pi pi-times" 
        severity="secondary" 
        onClick={hideStatusUpdateDialog} 
      />
      <div className="flex gap-2">
        <Button 
          label={t('APPROVE')} 
          icon="pi pi-check" 
          severity="success" 
          onClick={() => handleStatusUpdate(1)}
          disabled={selectedRequest?.status?.toString() === 'approved'}
        />
        <Button 
          label={t('REJECT')} 
          icon="pi pi-times" 
          severity="danger" 
          onClick={() => handleStatusUpdate(2)}
          disabled={selectedRequest?.status?.toString() === 'rejected'}
        />
      </div>
    </>
  );

  return (
    <div className="space-y-4">
      <Toast ref={toast} />
      <ListPage
        title={t('MENU.WITHDRAWAL_REQUEST', { defaultValue: 'درخواست برداشت' })}
        description={t('WITHDRAW_REQUEST.PAGE.DESCRIPTION', { defaultValue: 'بررسی و ثبت درخواست‌های برداشت نمایندگان' })}
        loading={loading}
        actions={
          <UiButton size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t('CREATE_WITHDRAW_REQUEST', { defaultValue: 'درخواست جدید' })}
          </UiButton>
        }
        toolbar={
          <FilterBar
            search={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder={t('SEARCH', { defaultValue: 'جستجو...' })}
            chips={chips}
            onRemoveChip={removeChip}
            onClearAll={chips.length ? clearFilters : undefined}
            onOpenFilters={() => {
              setDraftStatusFilter(statusFilter);
              setDraftDateRange(dateRange);
              setFilterOpen(true);
            }}
          />
        }
        footer={
          <div className="flex flex-col gap-2 border-t border-emerald-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              {t('DATA_TABLE.TABLE.PAGINATOR.SHOWING', { defaultValue: 'صفحه' })}{' '}
              {pagination?.page || 1} / {totalPages} · {pagination?.total || filteredWithdrawRequests.length}
            </div>
            <div className="flex items-center gap-2">
              <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) <= 1} onClick={() => onPageChange((pagination?.page || 1) - 1)}>
                قبلی
              </UiButton>
              <UiButton variant="outline" size="sm" disabled={(pagination?.page || 1) >= totalPages} onClick={() => onPageChange((pagination?.page || 1) + 1)}>
                بعدی
              </UiButton>
            </div>
          </div>
        }
      >
        <table className="w-full min-w-[1280px] border-collapse text-xs">
          <thead>
            <tr className="border-b border-emerald-100 bg-emerald-50/70 text-start">
              <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('COMMON.ACTIONS', { defaultValue: 'عملیات' })}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950">{t('RESELLER')}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950">{t('MENU.CURRENCY')}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950">{t('AMOUNT')}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950">{t('NET_AMOUNT')}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950">{t('COMMISSION')}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950 min-w-[14rem]">{t('BANK_DETAILS')}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950">{t('STATUS')}</th>
              <th className="px-2 py-2 font-semibold text-emerald-950 whitespace-nowrap">{t('DATE')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredWithdrawRequests.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-2 py-12 text-center text-muted-foreground">
                  {t('NO_DATA_AVAILABLE', { defaultValue: 'داده‌ای یافت نشد' })}
                </td>
              </tr>
            ) : (
              filteredWithdrawRequests.map((row: WithdrawRequest) => {
                const sym = row.currency?.symbol || '';
                const status = row.status?.toString() || 'pending';
                return (
                  <tr key={row.id} className="border-b border-emerald-50 transition hover:bg-emerald-50/50">
                    <td className="px-2 py-1.5 align-middle">
                      <RowActions items={getWithdrawRowActions(row)} />
                    </td>
                    <td className="px-2 py-1.5 text-start">
                      <div className="font-medium">{row.reseller?.reseller_name}</div>
                      <div className="text-[10px] text-muted-foreground">{row.reseller?.email}</div>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`fi fi-${row.currency?.code?.toLowerCase()?.substring(0, 2) || 'us'} fis me-1`} />
                      {row.currency?.code} ({sym})
                    </td>
                    <td className="px-2 py-1.5 tabular-nums font-medium">
                      {Number(row.amount).toLocaleString('fa-IR')} {sym}
                    </td>
                    <td className="px-2 py-1.5 tabular-nums">
                      {Number(row.net_amount || row.amount).toLocaleString('fa-IR')} {sym}
                    </td>
                    <td className="px-2 py-1.5 tabular-nums">
                      {Number(row.commission_amount || 0).toLocaleString('fa-IR')} {sym}
                    </td>
                    <td className="px-2 py-1.5 text-start text-[10px] leading-relaxed text-muted-foreground">
                      <div>{t('BANK')}: {row.bank_details?.bank_name || '—'}</div>
                      <div>{t('ACCOUNT_HOLDER')}: {row.bank_details?.account_holder_name || '—'}</div>
                      <div>{t('ACCOUNT_NUMBER')}: {row.bank_details?.account_number || '—'}</div>
                    </td>
                    <td className="px-2 py-1.5">
                      <Badge variant={withdrawStatusVariant(status)} className="text-[10px]">
                        {status === 'approved' ? t('APPROVED') : status === 'rejected' ? t('REJECTED') : t('PENDING')}
                      </Badge>
                    </td>
                    <td className="px-2 py-1.5 whitespace-nowrap tabular-nums text-muted-foreground">
                      {row.created_at ? new Date(row.created_at).toLocaleString('fa-IR', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </ListPage>

      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t('FILTER', { defaultValue: 'فیلتر' })}</SheetTitle>
            <SheetDescription>{t('WITHDRAW_REQUEST.FILTER.HINT', { defaultValue: 'فیلترها روی نتایج سرور اعمال می‌شوند.' })}</SheetDescription>
          </SheetHeader>
          <div className={FILTER_SHEET_BODY_CLASS}>
            <FilterField label={t('STATUS')}>
              <Select value={draftStatusFilter || 'all'} onValueChange={(v) => setDraftStatusFilter(v === 'all' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('FILTER_BY_STATUS', { defaultValue: 'وضعیت' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('ALL_STATUS')}</SelectItem>
                  <SelectItem value="pending">{t('PENDING')}</SelectItem>
                  <SelectItem value="approved">{t('APPROVED')}</SelectItem>
                  <SelectItem value="rejected">{t('REJECTED')}</SelectItem>
                </SelectContent>
              </Select>
            </FilterField>
            <FilterField label={t('START_DATE', { defaultValue: 'از تاریخ' })}>
              <Input
                type="date"
                value={draftDateRange[0] ? draftDateRange[0].toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setDraftDateRange([e.target.value ? new Date(e.target.value) : null, draftDateRange[1]])
                }
              />
            </FilterField>
            <FilterField label={t('END_DATE', { defaultValue: 'تا تاریخ' })}>
              <Input
                type="date"
                value={draftDateRange[1] ? draftDateRange[1].toISOString().split('T')[0] : ''}
                onChange={(e) =>
                  setDraftDateRange([draftDateRange[0], e.target.value ? new Date(e.target.value) : null])
                }
              />
            </FilterField>
            <div className="flex gap-2 pt-2">
              <UiButton className="flex-1" onClick={applyFilters}>
                {t('APPLY', { defaultValue: 'اعمال' })}
              </UiButton>
              <UiButton className="flex-1" variant="secondary" onClick={clearFilters}>
                {t('RESET', { defaultValue: 'بازنشانی' })}
              </UiButton>
            </div>
          </div>
        </SheetContent>
      </Sheet>

          <FormSheet
            open={withdrawRequestDialog}
            onOpenChange={(open) => {
              if (!open) hideDialog();
            }}
            title={t('CREATE_WITHDRAW_REQUEST')}
            description="درخواست برداشت جدید برای نماینده"
            size="xl"
            side="left"
            footer={
              <FormActions
                onCancel={hideDialog}
                onSubmit={saveWithdrawRequest}
                cancelLabel={t('CANCEL')}
                submitLabel={t('SAVE')}
              />
            }
          >
            <FormSection title="نماینده" description="انتخاب نماینده و ارز">
              <FormField
                label={t('RESELLER')}
                required
                error={submitted && !withdrawRequest.reseller_id ? t('THIS_FIELD_IS_REQUIRED') : null}
              >
                <SearchSelect
                  value={resellers.find((r: Reseller) => r.id === withdrawRequest.reseller_id) || null}
                  options={resellers || []}
                  onChange={(selected) => handleResellerChange(Number(selected?.id))}
                  optionLabel="reseller_name"
                  placeholder={t('SELECT_RESELLER')}
                  error={submitted && !withdrawRequest.reseller_id}
                  returnFullObject
                />
              </FormField>
              <FormField
                label={t('CURRENCY')}
                required
                error={submitted && !withdrawRequest.currency_id ? t('PLEASE_SELECT_A_RESELLER_FIRST') : null}
              >
                <Input
                  id="currency_id"
                  value={
                    selectedResellerCurrency
                      ? `${selectedResellerCurrency.code} (${selectedResellerCurrency.symbol}) - ${selectedResellerCurrency.name}`
                      : t('SELECT_RESELLER_FIRST')
                  }
                  disabled
                  className="w-full p-disabled"
                  placeholder={t('CURRENCY_WILL_BE_AUTO_SELECTED')}
                />
              </FormField>
            </FormSection>
            <FormSection title="مبالغ" description="مبلغ، خالص و کارمزد">
              <FormField
                label={t('AMOUNT')}
                required
                error={
                  submitted && (!withdrawRequest.amount || withdrawRequest.amount <= 0)
                    ? t('AMOUNT_MUST_BE_GREATER_THAN_ZERO')
                    : null
                }
              >
                <NumberInput
                  id="amount"
                  value={withdrawRequest.amount}
                  onValueChange={(v) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      amount: v ?? 0
                    }))
                  }
                  min={0}
                  step={0.01}
                  allowNull={false}
                  className={classNames('w-full', {
                    'border-rose-300': submitted && (!withdrawRequest.amount || withdrawRequest.amount <= 0)
                  })}
                  placeholder={t('ENTER_AMOUNT')}
                />
              </FormField>
              <FormField label={t('NET_AMOUNT')}>
                <NumberInput
                  id="net_amount"
                  value={withdrawRequest.net_amount ?? withdrawRequest.amount}
                  onValueChange={(v) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      net_amount: v ?? withdrawRequest.amount
                    }))
                  }
                  min={0}
                  step={0.01}
                  allowNull={false}
                  className="w-full"
                  placeholder={t('ENTER_NET_AMOUNT')}
                />
              </FormField>
              <FormField label={t('COMMISSION_AMOUNT')}>
                <NumberInput
                  id="commission_amount"
                  value={withdrawRequest.commission_amount}
                  onValueChange={(v) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      commission_amount: v ?? 0
                    }))
                  }
                  min={0}
                  step={0.01}
                  allowNull={false}
                  className="w-full"
                  placeholder={t('ENTER_COMMISSION_AMOUNT')}
                />
              </FormField>
            </FormSection>
            <FormSection title="اطلاعات بانکی" description="حساب مقصد برداشت">
              <FormField
                label={t('BANK_NAME')}
                required
                error={submitted && !withdrawRequest.bank_details?.bank_name ? t('THIS_FIELD_IS_REQUIRED') : null}
              >
                <Input
                  id="bank_name"
                  value={withdrawRequest.bank_details?.bank_name || ''}
                  onChange={(e) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        bank_name: e.target.value
                      }
                    }))
                  }
                  className={classNames('w-full', {
                    'p-invalid': submitted && !withdrawRequest.bank_details?.bank_name
                  })}
                  placeholder={t('ENTER_BANK_NAME')}
                />
              </FormField>
              <FormField
                label={t('ACCOUNT_HOLDER_NAME')}
                required
                error={submitted && !withdrawRequest.bank_details?.account_holder_name ? t('THIS_FIELD_IS_REQUIRED') : null}
              >
                <Input
                  id="account_holder_name"
                  value={withdrawRequest.bank_details?.account_holder_name || ''}
                  onChange={(e) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        account_holder_name: e.target.value
                      }
                    }))
                  }
                  className={classNames('w-full', {
                    'p-invalid': submitted && !withdrawRequest.bank_details?.account_holder_name
                  })}
                  placeholder={t('ENTER_ACCOUNT_HOLDER_NAME')}
                />
              </FormField>
              <FormField
                label={t('ACCOUNT_NUMBER')}
                required
                error={submitted && !withdrawRequest.bank_details?.account_number ? t('THIS_FIELD_IS_REQUIRED') : null}
              >
                <Input
                  id="account_number"
                  value={withdrawRequest.bank_details?.account_number || ''}
                  onChange={(e) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        account_number: e.target.value
                      }
                    }))
                  }
                  className={classNames('w-full', {
                    'p-invalid': submitted && !withdrawRequest.bank_details?.account_number
                  })}
                  placeholder={t('ENTER_ACCOUNT_NUMBER')}
                />
              </FormField>
              <FormField label={t('IBAN')}>
                <Input
                  id="iban"
                  value={withdrawRequest.bank_details?.iban || ''}
                  onChange={(e) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        iban: e.target.value
                      }
                    }))
                  }
                  className="w-full"
                  placeholder={t('ENTER_IBAN')}
                />
              </FormField>
              <FormField label={t('BRANCH')}>
                <Input
                  id="branch"
                  value={withdrawRequest.bank_details?.branch || ''}
                  onChange={(e) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        branch: e.target.value
                      }
                    }))
                  }
                  className="w-full"
                  placeholder={t('ENTER_BRANCH')}
                />
              </FormField>
              <FormField label={t('SWIFT_CODE')}>
                <Input
                  id="swift_code"
                  value={withdrawRequest.bank_details?.swift_code || ''}
                  onChange={(e) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        swift_code: e.target.value
                      }
                    }))
                  }
                  className="w-full"
                  placeholder={t('ENTER_SWIFT_CODE')}
                />
              </FormField>
            </FormSection>
            <FormSection title={t('ADMIN_NOTE')}>
              <FormField label={t('ADMIN_NOTE')} fullWidth>
                <Textarea
                  id="admin_note"
                  value={withdrawRequest.admin_note || ''}
                  onChange={(e) =>
                    setWithdrawRequest((prev) => ({
                      ...prev,
                      admin_note: e.target.value
                    }))
                  }
                  rows={3}
                  className="w-full"
                  placeholder={t('ENTER_ADMIN_NOTE_OPTIONAL')}
                />
              </FormField>
            </FormSection>
          </FormSheet>

          {/* Status Update Dialog */}
          <Dialog
            visible={statusUpdateDialog}
            style={{ width: '550px' }}
            header={t('UPDATE_WITHDRAW_STATUS')}
            modal
            footer={statusUpdateDialogFooter}
            onHide={hideStatusUpdateDialog}
          >
            {selectedRequest && (
              <div className="flex flex-column gap-4">
                {/* Request Information */}
                <div className="surface-50 p-3 border-round">
                  <div className="grid">
                    <div className="col-6">
                      <div className="text-sm font-semibold text-500 mb-1">{t('RESELLER')}</div>
                      <div className="font-bold">{selectedRequest.reseller?.reseller_name}</div>
                      <div className="text-sm text-500">{selectedRequest.reseller?.email}</div>
                    </div>
                    <div className="col-6">
                      <div className="text-sm font-semibold text-500 mb-1">{t('REQUEST_ID')}</div>
                      <div className="font-bold">#{selectedRequest.id}</div>
                      <div className="text-sm text-500">
                        {new Date(selectedRequest.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amount Information */}
                <div className="surface-50 p-3 border-round">
                  <div className="grid">
                    <div className="col-4">
                      <div className="text-sm font-semibold text-500 mb-1">{t('AMOUNT')}</div>
                      <div className="font-bold text-primary">
                        {Number(selectedRequest.amount).toLocaleString()} {selectedRequest.currency?.symbol}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-sm font-semibold text-500 mb-1">{t('COMMISSION')}</div>
                      <div className="font-bold text-500">
                        {Number(selectedRequest.commission_amount).toLocaleString()} {selectedRequest.currency?.symbol}
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-sm font-semibold text-500 mb-1">{t('NET_AMOUNT')}</div>
                      <div className="font-bold text-green-600">
                        {Number(selectedRequest.net_amount).toLocaleString()} {selectedRequest.currency?.symbol}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="surface-50 p-3 border-round">
                  <div className="text-sm font-semibold text-500 mb-2">{t('BANK_DETAILS')}</div>
                  <div className="grid">
                    <div className="col-6 mb-2">
                      <div className="text-xs text-500">{t('BANK_NAME')}</div>
                      <div>{selectedRequest.bank_details?.bank_name || '-'}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <div className="text-xs text-500">{t('ACCOUNT_HOLDER')}</div>
                      <div>{selectedRequest.bank_details?.account_holder_name || '-'}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <div className="text-xs text-500">{t('ACCOUNT_NUMBER')}</div>
                      <div>{selectedRequest.bank_details?.account_number || '-'}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <div className="text-xs text-500">{t('IBAN')}</div>
                      <div>{selectedRequest.bank_details?.iban || '-'}</div>
                    </div>
                    {selectedRequest.bank_details?.branch && (
                      <div className="col-6 mb-2">
                        <div className="text-xs text-500">{t('BRANCH')}</div>
                        <div>{selectedRequest.bank_details.branch}</div>
                      </div>
                    )}
                    {selectedRequest.bank_details?.swift_code && (
                      <div className="col-6 mb-2">
                        <div className="text-xs text-500">{t('SWIFT_CODE')}</div>
                        <div>{selectedRequest.bank_details.swift_code}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Current Status */}
                <div className="flex align-items-center justify-content-between p-3 surface-50 border-round">
                  <div>
                    <div className="text-sm font-semibold text-500 mb-1">{t('CURRENT_STATUS')}</div>
                    <Badge variant={withdrawStatusVariant(selectedRequest.status?.toString())} className="text-[10px]">
                      {selectedRequest.status?.toString() === 'approved'
                        ? t('APPROVED')
                        : selectedRequest.status?.toString() === 'rejected'
                          ? t('REJECTED')
                          : t('PENDING')}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-500 mb-1">{t('REQUESTED_BY')}</div>
                    <div>{ t('SYSTEM')}</div>
                  </div>
                </div>

                {/* Admin Note Input */}
                <div className="field w-full">
                  <label htmlFor="admin_note" className="font-bold block mb-2">
                    {t('ADMIN_NOTE')} {selectedRequest.admin_note && <span className="text-500">({t('EXISTING_NOTE')})</span>}
                  </label>
                  <textarea
                    id="admin_note"
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={3}
                    className="w-full"
                    placeholder={t('ENTER_ADMIN_NOTE_OPTIONAL')}
                  />
                  {selectedRequest.admin_note && (
                    <small className="text-500 mt-1 block">
                      {t('EXISTING_NOTE')}: {selectedRequest.admin_note}
                    </small>
                  )}
                </div>
              </div>
            )}
          </Dialog>
    </div>
  );
};

export default withAuth(WithdrawRequestsPage);