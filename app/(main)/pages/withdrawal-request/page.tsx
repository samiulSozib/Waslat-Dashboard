/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { classNames } from 'primereact/utils';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { AppDispatch } from '@/app/redux/store';
import { Currency, Reseller, WithdrawRequest } from '@/types/interface';
import { ProgressBar } from 'primereact/progressbar';
import withAuth from '../../authGuard';
import { useTranslation } from 'react-i18next';
import { customCellStyle } from '../../utilities/customRow';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
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
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [adminNote, setAdminNote] = useState('');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [selectedResellerCurrency, setSelectedResellerCurrency] = useState<Currency | null>(null);
  
  const toast = useRef<Toast>(null);
  const dt = useRef<DataTable<any>>(null);
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

  const rightToolbarTemplate = () => {
    return (
      <React.Fragment>
        <div className="flex justify-end items-center space-x-2">
          <Button
            style={{ gap: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? '0.5rem' : '' }}
            label={t('CREATE_WITHDRAW_REQUEST')}
            icon="pi pi-plus"
            severity="success"
            className={['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'ml-2' : 'mr-2'}
            onClick={openNew}
          />
        </div>
      </React.Fragment>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="flex flex-wrap align-items-center gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            type="search"
            onInput={(e) => setGlobalFilter(e.currentTarget.value)}
            placeholder={t('SEARCH')}
            className="w-full"
          />
        </span>
        
        {/* Status Filter */}
        <Dropdown
          value={statusFilter}
          options={[
            { label: t('ALL_STATUS'), value: '' },
            { label: t('PENDING'), value: 'pending' },
            { label: t('APPROVED'), value: 'approved' },
            { label: t('REJECTED'), value: 'rejected' }
          ]}
          onChange={(e) => setStatusFilter(e.value)}
          placeholder={t('FILTER_BY_STATUS')}
          className="w-full md:w-14rem"
        />
        
        
        
        
      </div>
    );
  };

  const resellerBodyTemplate = (rowData: WithdrawRequest) => {
    return (
      <>
        <span className="p-column-title">{t('RESELLER')}</span>
        <div className="flex align-items-center gap-2">
          <div>
            <div className="font-bold">{rowData.reseller?.reseller_name}</div>
            <small className="text-500">{rowData.reseller?.email}</small>
          </div>
        </div>
      </>
    );
  };

  const amountBodyTemplate = (rowData: WithdrawRequest) => {
    const currencySymbol = rowData.currency?.symbol || '';
    return (
      <>
        <span className="p-column-title">{t('AMOUNT')}</span>
        <div className="flex align-items-center gap-2">
          {rowData.currency?.code && (
            <span className={`fi fi-${rowData.currency.code.toLowerCase().substring(0, 2) || 'us'} fis`}></span>
          )}
          <span className="font-bold">
            {Number(rowData.amount).toLocaleString()} {currencySymbol}
          </span>
        </div>
      </>
    );
  };

  const bankDetailsBodyTemplate = (rowData: WithdrawRequest) => {
    return (
      <>
        <span className="p-column-title">{t('BANK_DETAILS')}</span>
        <div>
          <div><strong>{t('BANK')}:</strong> {rowData.bank_details?.bank_name || '-'}</div>
          <div><strong>{t('ACCOUNT_HOLDER')}:</strong> {rowData.bank_details?.account_holder_name || '-'}</div>
          <div><strong>{t('ACCOUNT_NUMBER')}:</strong> {rowData.bank_details?.account_number || '-'}</div>
        </div>
      </>
    );
  };

  const statusBodyTemplate = (rowData: WithdrawRequest) => {
    const statusConfig: Record<string, { severity: string, icon: string, label: string }> = {
      'pending': { severity: 'warning', icon: 'pi pi-clock', label: t('PENDING') },
      'approved': { severity: 'success', icon: 'pi pi-check', label: t('APPROVED') },
      'rejected': { severity: 'danger', icon: 'pi pi-times', label: t('REJECTED') }
    };

    const statusStr = rowData.status?.toString() || 'pending';
    const config = statusConfig[statusStr] || statusConfig['pending'];

    return (
      <>
        <span className="p-column-title">{t('STATUS')}</span>
        <Tag
          value={config.label}
          severity={config.severity as any}
          icon={config.icon}
        />
      </>
    );
  };

  const dateBodyTemplate = (rowData: WithdrawRequest) => {
    return (
      <>
        <span className="p-column-title">{t('DATE')}</span>
        <div>
          <div><small>{new Date(rowData.created_at).toLocaleDateString()}</small></div>
          <div><small>{new Date(rowData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small></div>
        </div>
      </>
    );
  };

  const actionBodyTemplate = (rowData: WithdrawRequest) => {
    const currentStatus = rowData.status?.toString() || 'pending';
    
    return (
      <div className="flex gap-1">
        {currentStatus === 'pending' && (
          <>
            <Button
              icon="pi pi-check"
              rounded
              severity="success"
              className="p-button-sm"
              onClick={() => confirmStatusUpdate(rowData, 1)}
              tooltip={t('APPROVE')}
              tooltipOptions={{ position: 'top' }}
            />
            <Button
              icon="pi pi-times"
              rounded
              severity="danger"
              className="p-button-sm"
              onClick={() => confirmStatusUpdate(rowData, 2)}
              tooltip={t('REJECT')}
              tooltipOptions={{ position: 'top' }}
            />
          </>
        )}
        
        
      </div>
    );
  };

  const currencyBodyTemplate = (rowData: WithdrawRequest) => {
    return (
      <>
        <span className="p-column-title">{t('CURRENCY')}</span>
        <div className="flex align-items-center gap-2">
          {rowData.currency?.code && (
            <span className={`fi fi-${rowData.currency.code.toLowerCase().substring(0, 2) || 'us'} fis`}></span>
          )}
          <span>{rowData.currency?.code} ({rowData.currency?.symbol})</span>
        </div>
      </>
    );
  };

  const withdrawRequestDialogFooter = (
    <>
      <Button label={t('CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={hideDialog} />
      <Button label={t('SAVE')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={saveWithdrawRequest} />
    </>
  );

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
    <div className="grid -m-5">
      <div className="col-12">
        <div className="card p-2">
          {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
          <Toast ref={toast} />

          <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

          <DataTable
            ref={dt}
            value={withdrawRequests}
            selection={selectedWithdrawRequests}
            onSelectionChange={(e) => setSelectedWithdrawRequests(e.value as any)}
            dataKey="id"
            paginator
            rows={10}
            rowsPerPageOptions={[5, 10, 25]}
            className="datatable-responsive"
            paginatorTemplate={
              isRTL() ? 'RowsPerPageDropdown CurrentPageReport LastPageLink NextPageLink PageLinks PrevPageLink FirstPageLink' : 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'
            }
            currentPageReportTemplate={
              isRTL()
                ? `Showing {first} to {last} of {totalRecords} entries`
                : `Showing {first} to {last} of {totalRecords} entries`
            }
            emptyMessage={t('NO_DATA_AVAILABLE')}
            dir={isRTL() ? 'rtl' : 'ltr'}
            style={{ direction: isRTL() ? 'rtl' : 'ltr', fontFamily: "'iranyekan', sans-serif,iranyekan" }}
            globalFilter={globalFilter}
            responsiveLayout="scroll"
          >
            <Column selectionMode="multiple" headerStyle={{ width: '4rem' }}></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              field="id"
              header="ID"
              sortable
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('RESELLER')}
              body={resellerBodyTemplate}
              sortable
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('CURRENCY')}
              body={currencyBodyTemplate}
              sortable
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('AMOUNT')}
              body={amountBodyTemplate}
              sortable
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('NET_AMOUNT')}
              body={(rowData: WithdrawRequest) => {
                const currencySymbol = rowData.currency?.symbol || '';
                return (
                  <div className="flex align-items-center gap-2">
                    <span className={`fi fi-${rowData.currency?.code?.toLowerCase()?.substring(0, 2) || 'us'} fis`}></span>
                    <span className="font-bold">
                      {Number(rowData.net_amount || rowData.amount).toLocaleString()} {currencySymbol}
                    </span>
                  </div>
                );
              }}
              sortable
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('COMMISSION')}
              body={(rowData: WithdrawRequest) => {
                const currencySymbol = rowData.currency?.symbol || '';
                return (
                  <div className="flex align-items-center gap-2">
                    <span className={`fi fi-${rowData.currency?.code?.toLowerCase()?.substring(0, 2) || 'us'} fis`}></span>
                    <span className="font-bold">
                      {Number(rowData.commission_amount || 0).toLocaleString()} {currencySymbol}
                    </span>
                  </div>
                );
              }}
              sortable
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('BANK_DETAILS')}
              body={bankDetailsBodyTemplate}
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('STATUS')}
              body={statusBodyTemplate}
              sortable
            ></Column>
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              header={t('DATE')}
              body={dateBodyTemplate}
              sortable
            ></Column>
           
            <Column
              style={{ ...customCellStyle, textAlign: ['ar', 'fa', 'ps', 'bn'].includes(i18n.language) ? 'right' : 'left' }}
              body={actionBodyTemplate}
              headerStyle={{ minWidth: '12rem' }}
              header={t('COMMON.ACTIONS')}
            ></Column>
          </DataTable>

          {/* Create Withdraw Request Dialog */}
          <Dialog
            visible={withdrawRequestDialog}
            style={{ width: '700px', padding: '5px' }}
            header={t('CREATE_WITHDRAW_REQUEST')}
            modal
            className="p-fluid"
            footer={withdrawRequestDialogFooter}
            onHide={hideDialog}
          >
            <div className="card" style={{ padding: '20px' }}>
              {/* Reseller Field */}
              <div className="field mb-4">
                <label htmlFor="reseller_id" style={{ fontWeight: 'bold' }}>
                  {t('RESELLER')} *
                </label>
                <Dropdown
                  id="reseller_id"
                  value={withdrawRequest.reseller_id}
                  options={resellers}
                  onChange={(e) => handleResellerChange(Number(e.value))}
                  optionLabel="reseller_name"
                  optionValue="id"
                  placeholder={t('SELECT_RESELLER')}
                  className={classNames({
                    'p-invalid': submitted && !withdrawRequest.reseller_id
                  })}
                  filter
                  filterBy="reseller_name,email,phone"
                  showClear
                />
                {submitted && !withdrawRequest.reseller_id && (
                  <small className="p-invalid" style={{ color: 'red' }}>
                    {t('THIS_FIELD_IS_REQUIRED')}
                  </small>
                )}
              </div>

              {/* Currency Field (Auto-selected and disabled) */}
              <div className="field mb-4">
                <label htmlFor="currency_id" style={{ fontWeight: 'bold' }}>
                  {t('CURRENCY')} *
                </label>
                <InputText
                  id="currency_id"
                  value={selectedResellerCurrency ? 
                    `${selectedResellerCurrency.code} (${selectedResellerCurrency.symbol}) - ${selectedResellerCurrency.name}` : 
                    t('SELECT_RESELLER_FIRST')
                  }
                  disabled
                  className="w-full p-disabled"
                  placeholder={t('CURRENCY_WILL_BE_AUTO_SELECTED')}
                />
                {submitted && !withdrawRequest.currency_id && (
                  <small className="p-invalid" style={{ color: 'red' }}>
                    {t('PLEASE_SELECT_A_RESELLER_FIRST')}
                  </small>
                )}
              </div>

              {/* Amount Fields */}
              <div className="formgrid grid mb-4">
                <div className="field col">
                  <label htmlFor="amount" style={{ fontWeight: 'bold' }}>
                    {t('AMOUNT')} *
                  </label>
                  <InputNumber
                    id="amount"
                    value={withdrawRequest.amount}
                    onValueChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      amount: Number(e.value) || 0
                    }))}
                    mode="decimal"
                    min={0}
                    className={classNames('w-full', {
                      'p-invalid': submitted && (!withdrawRequest.amount || withdrawRequest.amount <= 0)
                    })}
                    placeholder={t('ENTER_AMOUNT')}
                  />
                  {submitted && (!withdrawRequest.amount || withdrawRequest.amount <= 0) && (
                    <small className="p-invalid" style={{ color: 'red' }}>
                      {t('AMOUNT_MUST_BE_GREATER_THAN_ZERO')}
                    </small>
                  )}
                </div>
                <div className="field col">
                  <label htmlFor="net_amount" style={{ fontWeight: 'bold' }}>
                    {t('NET_AMOUNT')}
                  </label>
                  <InputNumber
                    id="net_amount"
                    value={withdrawRequest.net_amount || withdrawRequest.amount}
                    onValueChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      net_amount: Number(e.value) || withdrawRequest.amount
                    }))}
                    mode="decimal"
                    min={0}
                    className="w-full"
                    placeholder={t('ENTER_NET_AMOUNT')}
                  />
                </div>
              </div>

              {/* Commission Amount */}
              <div className="field mb-4">
                <label htmlFor="commission_amount" style={{ fontWeight: 'bold' }}>
                  {t('COMMISSION_AMOUNT')}
                </label>
                <InputNumber
                  id="commission_amount"
                  value={withdrawRequest.commission_amount}
                  onValueChange={(e) => setWithdrawRequest(prev => ({
                    ...prev,
                    commission_amount: Number(e.value) || 0
                  }))}
                  mode="decimal"
                  min={0}
                  className="w-full"
                  placeholder={t('ENTER_COMMISSION_AMOUNT')}
                />
              </div>

              {/* Bank Details */}
              <div className="formgrid grid mb-4">
                <div className="field col">
                  <label htmlFor="bank_name" style={{ fontWeight: 'bold' }}>
                    {t('BANK_NAME')} *
                  </label>
                  <InputText
                    id="bank_name"
                    value={withdrawRequest.bank_details?.bank_name || ''}
                    onChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        bank_name: e.target.value
                      }
                    }))}
                    className={classNames('w-full', {
                      'p-invalid': submitted && !withdrawRequest.bank_details?.bank_name
                    })}
                    placeholder={t('ENTER_BANK_NAME')}
                  />
                  {submitted && !withdrawRequest.bank_details?.bank_name && (
                    <small className="p-invalid" style={{ color: 'red' }}>
                      {t('THIS_FIELD_IS_REQUIRED')}
                    </small>
                  )}
                </div>
                <div className="field col">
                  <label htmlFor="account_holder_name" style={{ fontWeight: 'bold' }}>
                    {t('ACCOUNT_HOLDER_NAME')} *
                  </label>
                  <InputText
                    id="account_holder_name"
                    value={withdrawRequest.bank_details?.account_holder_name || ''}
                    onChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        account_holder_name: e.target.value
                      }
                    }))}
                    className={classNames('w-full', {
                      'p-invalid': submitted && !withdrawRequest.bank_details?.account_holder_name
                    })}
                    placeholder={t('ENTER_ACCOUNT_HOLDER_NAME')}
                  />
                  {submitted && !withdrawRequest.bank_details?.account_holder_name && (
                    <small className="p-invalid" style={{ color: 'red' }}>
                      {t('THIS_FIELD_IS_REQUIRED')}
                    </small>
                  )}
                </div>
              </div>

              {/* Account Number and IBAN */}
              <div className="formgrid grid mb-4">
                <div className="field col">
                  <label htmlFor="account_number" style={{ fontWeight: 'bold' }}>
                    {t('ACCOUNT_NUMBER')} *
                  </label>
                  <InputText
                    id="account_number"
                    value={withdrawRequest.bank_details?.account_number || ''}
                    onChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        account_number: e.target.value
                      }
                    }))}
                    className={classNames('w-full', {
                      'p-invalid': submitted && !withdrawRequest.bank_details?.account_number
                    })}
                    placeholder={t('ENTER_ACCOUNT_NUMBER')}
                  />
                  {submitted && !withdrawRequest.bank_details?.account_number && (
                    <small className="p-invalid" style={{ color: 'red' }}>
                      {t('THIS_FIELD_IS_REQUIRED')}
                    </small>
                  )}
                </div>
                <div className="field col">
                  <label htmlFor="iban" style={{ fontWeight: 'bold' }}>
                    {t('IBAN')}
                  </label>
                  <InputText
                    id="iban"
                    value={withdrawRequest.bank_details?.iban || ''}
                    onChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        iban: e.target.value
                      }
                    }))}
                    className="w-full"
                    placeholder={t('ENTER_IBAN')}
                  />
                </div>
              </div>

              {/* Branch and Swift Code */}
              <div className="formgrid grid mb-4">
                <div className="field col">
                  <label htmlFor="branch" style={{ fontWeight: 'bold' }}>
                    {t('BRANCH')}
                  </label>
                  <InputText
                    id="branch"
                    value={withdrawRequest.bank_details?.branch || ''}
                    onChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        branch: e.target.value
                      }
                    }))}
                    className="w-full"
                    placeholder={t('ENTER_BRANCH')}
                  />
                </div>
                <div className="field col">
                  <label htmlFor="swift_code" style={{ fontWeight: 'bold' }}>
                    {t('SWIFT_CODE')}
                  </label>
                  <InputText
                    id="swift_code"
                    value={withdrawRequest.bank_details?.swift_code || ''}
                    onChange={(e) => setWithdrawRequest(prev => ({
                      ...prev,
                      bank_details: {
                        ...prev.bank_details,
                        swift_code: e.target.value
                      }
                    }))}
                    className="w-full"
                    placeholder={t('ENTER_SWIFT_CODE')}
                  />
                </div>
              </div>

              {/* Admin Note */}
              <div className="field mb-4">
                <label htmlFor="admin_note" style={{ fontWeight: 'bold' }}>
                  {t('ADMIN_NOTE')}
                </label>
                <textarea
                  id="admin_note"
                  value={withdrawRequest.admin_note || ''}
                  onChange={(e:any) => setWithdrawRequest(prev => ({
                    ...prev,
                    admin_note: e.target.value
                  }))}
                  rows={3}
                  className="w-full"
                  placeholder={t('ENTER_ADMIN_NOTE_OPTIONAL')}
                />
              </div>
            </div>
          </Dialog>

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
                    {statusBodyTemplate(selectedRequest)}
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
      </div>
    </div>
  );
};

export default withAuth(WithdrawRequestsPage);