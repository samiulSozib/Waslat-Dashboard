'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/app/redux/store';
import { fetchProviderInfo } from '@/app/redux/actions/providerInfoActions';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../utilities/rtlUtil';
import { customCellStyle } from '../../utilities/customRow';

interface ProviderViewPageProps { providerId: number }
type AnyRow = Record<string, any>;

const parseDate = (value: any) => {
  if (!value) return null;
  // Laravel returns YYYY-MM-DD HH:mm:ss; parse as local time consistently.
  const d = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d;
};
const formatDate = (value: any) => parseDate(value)?.toLocaleString('en-US', {
  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
}) ?? '-';
const formatCurrency = (amount: any, currency = 'AFN') =>
  amount === null || amount === undefined || amount === '' || !Number.isFinite(Number(amount))
    ? '—'
    : `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 5 }).format(Number(amount))} ${currency}`;
const orderStatus = (status: any) => {
  switch (Number(status)) {
    case 1: return { label: 'Confirmed', severity: 'success' as const };
    case 2: return { label: 'Rejected', severity: 'danger' as const };
    case 3: return { label: 'Processing', severity: 'info' as const };
    default: return { label: 'Pending', severity: 'warning' as const };
  }
};

const zoodPayStatusBadge = (row: AnyRow) => {
  const raw = String(row.zoodpay_status || row.supplier_status || row.supplier_state || '').trim();
  const state = raw.toLowerCase();
  let severity: 'success' | 'danger' | 'warning' | 'info' | 'secondary' = 'warning';
  if (['success', 'successful', 'completed', 'supplier_success'].includes(state)) severity = 'success';
  else if (['rejected', 'failed', 'failure', 'supplier_rejected', 'supplier_failed'].includes(state)) severity = 'danger';
  else if (['processing', 'in progress', 'in_process', 'pending', 'supplier_processing'].includes(state)) severity = 'info';
  const label = raw || 'Not verified';
  const checked = row.live_check_result && row.live_check_result !== 'not_requested';
  return <div className="flex flex-column gap-1 align-items-start">
    <Tag value={label} severity={severity} />
    <small className="text-500">{row.zoodpay_status_source === 'live_supplier_api' ? 'Live ZoodPay' : 'Saved status'}</small>
    {checked && row.live_check_result !== 'received' && <small className="text-orange-500">Lookup: {row.live_check_result}</small>}
  </div>;
};

const ProviderViewPage: React.FC<ProviderViewPageProps> = ({ providerId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation();
  const { loading, accountData, error } = useSelector((state: any) => state.providerInfoReducer);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [supplierLive, setSupplierLive] = useState(false);
  const isZoodPay = String(accountData?.provider?.code || '').toLowerCase() === 'zoodpay';

  useEffect(() => { setPage(1); setRows(10); setSearch(''); setStatus(null); setSupplierLive(false); }, [providerId]);
  useEffect(() => { if (providerId) dispatch(fetchProviderInfo(providerId, page, rows, supplierLive)); }, [dispatch, providerId, page, rows, supplierLive]);

  const refresh = () => dispatch(fetchProviderInfo(providerId, page, rows, supplierLive));
  const checkSupplierStatus = () => {
    if (supplierLive) dispatch(fetchProviderInfo(providerId, page, rows, true));
    else setSupplierLive(true);
  };
  const transactions: AnyRow[] = Array.isArray(accountData?.recent_transactions) ? accountData.recent_transactions : [];
  const visible = useMemo(() => transactions.filter(row => {
    if (!isZoodPay) return true;
    const s = search.trim().toLowerCase();
    const matchesSearch = !s || [row.order_id, row.reference, row.phone_number, row.provider_transaction_id, row.description]
      .some(value => String(value ?? '').toLowerCase().includes(s));
    return matchesSearch && (status === null || Number(row.status) === status);
  }), [transactions, isZoodPay, search, status]);

  const downloadCsv = () => {
    const columns = ['order_id', 'reference', 'provider_transaction_id', 'phone_number', 'amount', 'currency', 'description', 'status', 'waslat_status', 'zoodpay_status', 'zoodpay_status_source', 'live_check_result', 'supplier_state', 'local_settlement', 'created_at'];
    const quote = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [columns.join(','), ...visible.map(row => columns.map(key => quote(row[key])).join(','))].join('\r\n');
    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = href;
    a.download = `zoodpay-orders-page-${page}.csv`; a.click();
    URL.revokeObjectURL(href);
  };

  if (loading && !accountData) return <div className="p-4"><ProgressBar mode="indeterminate" style={{ height: '6px' }} /><div className="text-center mt-4">{t('LOADING')}...</div></div>;
  if (error && !accountData) return <div className="p-4"><Card><div className="text-center text-red-500"><i className="pi pi-exclamation-triangle text-2xl" /><p>{error}</p><Button label={t('GO_BACK')} icon="pi pi-arrow-left" onClick={() => router.back()} /></div></Card></div>;
  if (!accountData) return <div className="p-4 text-center">{t('NO_DATA_FOUND')}</div>;

  const currency = accountData.account_info?.currency || 'AFN';
  const provider = accountData.provider || {};

  return <div className="p-2">
    <div className="flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div><h1 className="text-2xl font-bold m-0">{provider.name}</h1><div className="text-600 mt-2">ID: {provider.id} | Code: {provider.code}</div></div>
      {isZoodPay && <Button label="Refresh" icon="pi pi-refresh" outlined loading={loading} onClick={refresh} />}
    </div>
    {error && <div className="p-3 mb-3 border-round text-red-600" style={{ background: '#fff1f0' }}>{error}</div>}
    {loading && <ProgressBar mode="indeterminate" style={{ height: 4 }} className="mb-3" />}

    <div className="grid mb-3">
      <div className="col-12 md:col-4"><Card title={t('ACCOUNT_INFO.BALANCE')} className="h-full">
        <div className="text-center"><div className="text-3xl font-bold text-green-600">{formatCurrency(accountData.account_info?.balance, currency)}</div>
        <div className="text-sm text-500 mt-2">{t('LAST_UPDATED')}: {formatDate(accountData.account_info?.last_updated)}</div>
        {isZoodPay && !accountData.account_info?.balance_available && <Tag className="mt-2" value="Balance unavailable" severity="warning" />}</div>
      </Card></div>
      <div className="col-12 md:col-4"><Card title={t('USER_INFO')} className="h-full">
        {isZoodPay ? <div className="flex flex-column gap-3">
          <div className="flex justify-content-between gap-2"><span className="font-medium">User code</span><span>{accountData.user?.user_code || '—'}</span></div>
          <div className="flex justify-content-between gap-2"><span className="font-medium">Currency</span><span>{currency}</span></div>
          <div className="flex justify-content-between gap-2"><span className="font-medium">Balance API</span><Tag value={accountData.supplier_connection?.balance_success ? 'Connected' : 'Unavailable'} severity={accountData.supplier_connection?.balance_success ? 'success' : 'warning'} /></div>
        </div> : <div className="flex flex-column gap-2">
          <div className="flex justify-content-between"><span className="font-medium">{t('USER.UID')}:</span><span>{accountData.user?.uid ?? '—'}</span></div>
          <div className="flex justify-content-between"><span className="font-medium">{t('USER.NAME')}:</span><span>{accountData.user?.name ?? '—'}</span></div>
          <div className="flex justify-content-between"><span className="font-medium">{t('USER.BALANCE')}:</span><span>{formatCurrency(accountData.user?.balance, currency)}</span></div>
          <div className="flex justify-content-between"><span className="font-medium">{t('USER.LANGUAGE')}:</span><span>{accountData.user?.lang ?? '—'}</span></div>
        </div>}
      </Card></div>
      <div className="col-12 md:col-4"><Card title={t('PROVIDER_INFO')} className="h-full"><div className="flex flex-column gap-3">
        <div className="flex justify-content-between gap-2"><span className="font-medium">{t('PROVIDERS.HAS_CREDENTIALS')}:</span><Tag value={provider.has_credentials ? t('YES') : t('NO')} severity={provider.has_credentials ? 'success' : 'danger'} /></div>
        <div className="flex justify-content-between gap-2"><span className="font-medium">{t('PROVIDERS.ID')}:</span><span>{provider.id}</span></div>
        <div className="flex justify-content-between gap-2"><span className="font-medium">{t('PROVIDERS.CODE')}:</span><Tag value={provider.code} severity="info" /></div>
        {isZoodPay && <div className="flex justify-content-between gap-2"><span className="font-medium">Status:</span><Tag value={provider.is_active ? 'Active' : 'Inactive'} severity={provider.is_active ? 'success' : 'danger'} /></div>}
      </div></Card></div>
    </div>

    {isZoodPay && <>
      <div className="grid mb-3">
        {([['Total orders', 'total'], ['Confirmed', 'confirmed'], ['Pending', 'pending'], ['Processing', 'processing'], ['Rejected', 'rejected']] as const).map(([label, key]) =>
          <div key={key} className="col-6 md:col"><Card className="h-full"><div className="text-500 text-sm">{label}</div><div className="font-bold text-2xl mt-2">{accountData.statistics?.[key] ?? 0}</div></Card></div>)}
      </div>
      <Card title="Recharge Sales Report" className="mb-4">
        <div className="flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <span className="p-input-icon-left"><i className="pi pi-search" /><InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="Search phone or reference" /></span>
          <div className="flex gap-2 flex-wrap">
            <Dropdown value={status} onChange={e => setStatus(e.value)} options={[{ label: 'All statuses', value: null }, { label: 'Pending', value: 0 }, { label: 'Confirmed', value: 1 }, { label: 'Rejected', value: 2 }, { label: 'Processing', value: 3 }]} placeholder="Status" />
            <Button label="Check ZoodPay Status" icon="pi pi-sync" outlined loading={loading} onClick={checkSupplierStatus} title="Only checks recharge status via ZoodPay GET API. No recharge is sent." />
            <Button label="Export page" icon="pi pi-download" outlined onClick={downloadCsv} disabled={!visible.length} />
          </div>
        </div>
        <small className="block text-500 mb-3">Search, status filter and CSV export apply to the loaded page. ZoodPay and Waslat statuses are independent; supplier checks never resend credit or change balances. The API supplies server-side pagination.</small>
        <DataTable value={visible} dataKey="id" loading={loading} scrollable responsiveLayout="scroll" dir={isRTL() ? 'rtl' : 'ltr'} style={{ direction: isRTL() ? 'rtl' : 'ltr' }}
          paginator lazy first={(page - 1) * rows} rows={rows} totalRecords={accountData.pagination?.total_items ?? transactions.length}
          rowsPerPageOptions={[5, 10, 25, 50]} onPage={(event: DataTablePageEvent) => { setSupplierLive(false); setPage(event.page !== undefined ? event.page + 1 : Math.floor(event.first / event.rows) + 1); setRows(event.rows); }}
          emptyMessage="No recharge transactions found">
          <Column field="order_id" header="Order ID" sortable={false} style={customCellStyle} />
          <Column field="phone_number" header="Phone number" style={customCellStyle} />
          <Column field="amount" header="Recharge amount" body={row => formatCurrency(row.amount, row.currency || 'AFN')} style={customCellStyle} />
          <Column field="reference" header="Waslat reference" style={customCellStyle} />
          <Column field="zoodpay_status" header="ZoodPay status" body={zoodPayStatusBadge} style={customCellStyle} />
          <Column field="status" header="Waslat status" body={row => { const s = orderStatus(row.status); return <Tag value={s.label} severity={s.severity} />; }} style={customCellStyle} />
          <Column field="local_settlement" header="Settlement" body={row => row.local_settlement || '—'} style={customCellStyle} />
          <Column field="created_at" header="Date" body={row => formatDate(row.created_at)} style={customCellStyle} />
        </DataTable>
      </Card>
      <Card title="Supported mobile operators" className="mb-4">
        <DataTable value={Array.isArray(accountData.operators) ? accountData.operators : []} dataKey="id" emptyMessage="No operator details available" responsiveLayout="scroll">
          <Column field="name" header="Operator" />
          <Column field="min_recharge_amount" header="Minimum recharge" body={row => formatCurrency(row.min_recharge_amount, 'AFN')} />
          <Column field="max_recharge_amount" header="Maximum recharge" body={row => formatCurrency(row.max_recharge_amount, 'AFN')} />
        </DataTable>
      </Card>
    </>}

    {!isZoodPay && <Card title={t('RECENT_TRANSACTIONS')} className="mb-4"><DataTable value={transactions} paginator rows={10} rowsPerPageOptions={[5, 10, 25, 50]} className="datatable-responsive" emptyMessage={t('NO_TRANSACTIONS_FOUND')} dir={isRTL() ? 'rtl' : 'ltr'} style={{ direction: isRTL() ? 'rtl' : 'ltr' }}>
      <Column field="id" header={t('TRANSACTION.ID')} sortable style={customCellStyle} />
      <Column field="b_name" header={t('TRANSACTION.DESCRIPTION')} style={customCellStyle} />
      <Column field="phone" header={t('TRANSACTION.PHONE')} style={customCellStyle} />
      <Column field="type" header={t('TRANSACTION.TYPE')} body={row => row.type === 'recharge' || row.type === 'balance' ? <Tag value={t(`TRANSACTION.TYPE.${row.type.toUpperCase()}`)} severity={row.type === 'recharge' ? 'success' : 'info'} /> : (row.type ?? '—')} style={customCellStyle} />
      <Column field="finalAmount" header={t('TRANSACTION.AMOUNT')} body={row => <span className="font-bold">{formatCurrency(row.finalAmount, currency)}</span>} sortable style={customCellStyle} />
      <Column field="created_at" header={t('TRANSACTION.DATE')} body={row => formatDate(row.created_at)} sortable style={customCellStyle} />
    </DataTable></Card>}
  </div>;
};

export default ProviderViewPage;
