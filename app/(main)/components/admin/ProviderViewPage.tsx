// app/components/admin/providers/ProviderViewPage.tsx
'use client';

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch } from '@/app/redux/store';
import { fetchProviderInfo } from '@/app/redux/actions/providerInfoActions';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';
import { customCellStyle } from '../../utilities/customRow';

interface ProviderViewPageProps {
  providerId: number;
}

const ProviderViewPage: React.FC<ProviderViewPageProps> = ({ providerId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { t } = useTranslation();
  
  const { loading, accountData, error } = useSelector((state: any) => state.providerInfoReducer);
  
  useEffect(() => {
    if (providerId) {
      dispatch(fetchProviderInfo(providerId));
    }
  }, [dispatch, providerId]);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };
  
  const getTransactionTypeSeverity = (type: string) => {
    switch (type) {
      case 'recharge': return 'success';
      case 'balance': return 'info';
      default: return null;
    }
  };
  
  const transactionTypeBodyTemplate = (rowData: any) => {
    const severity = getTransactionTypeSeverity(rowData.type);
    return severity ? (
      <Tag value={t(`TRANSACTION.TYPE.${rowData.type.toUpperCase()}`)} severity={severity} />
    ) : (
      <span>{rowData.type}</span>
    );
  };
  
  const amountBodyTemplate = (rowData: any) => {
    return (
      <span className="font-bold">
        {formatCurrency(rowData.finalAmount, accountData?.account_info.currency || 'AFN')}
      </span>
    );
  };
  
  const dateBodyTemplate = (rowData: any) => {
    return formatDate(rowData.created_at);
  };
  
  if (loading) {
    return (
      <div className="p-4">
        <ProgressBar mode="indeterminate" style={{ height: '6px' }} />
        <div className="text-center mt-4">{t('LOADING')}...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4">
        <Card>
          <div className="text-center text-red-500">
            <i className="pi pi-exclamation-triangle text-2xl"></i>
            <p className="mt-2">{error}</p>
            <Button 
              label={t('GO_BACK')} 
              icon="pi pi-arrow-left"
              className="mt-3"
              onClick={() => router.back()}
            />
          </div>
        </Card>
      </div>
    );
  }
  
  if (!accountData) {
    return (
      <div className="p-4">
        <div className="text-center">{t('NO_DATA_FOUND')}</div>
      </div>
    );
  }
  
  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{accountData.provider.name}</h1>
          <p className="text-gray-600">ID: {accountData.provider.id} | Code: {accountData.provider.code}</p>
        </div>
      
      </div>
      
      {/* Main Info Cards */}
      <div className="grid mb-4">
        <div className="col-12 md:col-4">
          <Card title={t('ACCOUNT_INFO.BALANCE')} className="h-full">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(accountData.account_info.balance, accountData.account_info.currency)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {t('LAST_UPDATED')}: {formatDate(accountData.account_info.last_updated)}
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-4">
          <Card title={t('USER_INFO')} className="h-full">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">{t('USER.UID')}:</span>
                <span>{accountData.user.uid}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('USER.NAME')}:</span>
                <span>{accountData.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('USER.BALANCE')}:</span>
                <span>{formatCurrency(accountData.user.balance, accountData.account_info.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('USER.LANGUAGE')}:</span>
                <span>{accountData.user.lang}</span>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-4">
          <Card title={t('PROVIDER_INFO')} className="h-full">
            <div className="space-y-2">
              <div className="flex justify-between gap-2">
                <span className="font-medium">{t('PROVIDERS.HAS_CREDENTIALS')}:</span>
                <Tag 
                  value={accountData.provider.has_credentials ? t('YES') : t('NO')} 
                  severity={accountData.provider.has_credentials ? "success" : "danger"} 
                />
              </div>
              <div className="flex justify-between">
                <span className="font-medium">{t('PROVIDERS.ID')}:</span>
                <span>{accountData.provider.id}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="font-medium">{t('PROVIDERS.CODE')}:</span>
                <Tag value={accountData.provider.code} severity="info" />
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Recent Transactions */}
      <Card title={t('RECENT_TRANSACTIONS')} className="mb-4">
        <DataTable
          value={accountData.recent_transactions}
          paginator
          rows={10}
          rowsPerPageOptions={[5, 10, 25, 50]}
          className="datatable-responsive"
          emptyMessage={t('NO_TRANSACTIONS_FOUND')}
          dir={isRTL() ? 'rtl' : 'ltr'}
          style={{ direction: isRTL() ? 'rtl' : 'ltr' }}
        >
          <Column 
            field="id" 
            header={t('TRANSACTION.ID')} 
            sortable 
            style={customCellStyle}
          />
          <Column 
            field="b_name" 
            header={t('TRANSACTION.DESCRIPTION')} 
            style={customCellStyle}
          />
          <Column 
            field="phone" 
            header={t('TRANSACTION.PHONE')} 
            style={customCellStyle}
          />
          <Column 
            field="type" 
            header={t('TRANSACTION.TYPE')} 
            body={transactionTypeBodyTemplate}
            style={customCellStyle}
          />
          <Column 
            field="finalAmount" 
            header={t('TRANSACTION.AMOUNT')} 
            body={amountBodyTemplate}
            style={customCellStyle}
            sortable
          />
          <Column 
            field="created_at" 
            header={t('TRANSACTION.DATE')} 
            body={dateBodyTemplate}
            style={customCellStyle}
            sortable
          />
        </DataTable>
      </Card>
      
     
    </div>
  );
};

export default ProviderViewPage;