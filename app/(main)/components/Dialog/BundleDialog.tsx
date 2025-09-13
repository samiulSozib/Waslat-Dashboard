/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { _fetchProviders } from '@/app/redux/actions/providerActions';
import { _fetchSingleProvider } from '@/app/redux/actions/singleProviderAction';
import { AppDispatch } from '@/app/redux/store';
import { Bundle, Provider, RawInternet, Service } from '@/types/interface';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { isRTL } from '../../utilities/rtlUtil';

interface BundleDialogProps {
  visible: boolean;
  onHide: () => void;
  bundle: Bundle;
  setBundle: (bundle: Bundle) => void;
  submitted: boolean;
  setSubmitted: (submitted: boolean) => void;
  services: Service[];
  currencies: any[];
  providers: Provider[];
  rawInternets: RawInternet[];
  dispatch: AppDispatch;
  toast: React.RefObject<Toast>;
  t: any;
  onSave: () => void;
}

const BundleDialog: React.FC<BundleDialogProps> = ({
  visible,
  onHide,
  bundle,
  setBundle,
  submitted,
  setSubmitted,
  services,
  currencies,
  providers,
  rawInternets,
  dispatch,
  toast,
  t,
  onSave
}) => {
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedCapability, setSelectedCapability] = useState('');
  const [selectedProviderBundle, setSelectedProviderBundle] = useState<RawInternet | null>(null);
  const [providerSearchTag, setProviderSearchTag] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (providerSearchTag) {
        dispatch(_fetchProviders(1, providerSearchTag));
      } else {
        dispatch(_fetchProviders(1, ''));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [providerSearchTag, dispatch]);

  useEffect(() => {
    if (selectedProvider && selectedCapability) {
      dispatch(_fetchSingleProvider(selectedProvider?.id, selectedProvider?.code, selectedCapability));
    }
  }, [dispatch, selectedProvider, selectedCapability]);

  // Populate provider data when editing an existing bundle with provider info
  useEffect(() => {
    if (bundle.id && bundle.api_provider_id && bundle.api_provider_bundle_id && bundle.api_binding) {
      // Find the provider
      const provider = providers.find(p => p.id === parseInt(bundle.api_provider_id as string));
      if (provider) {
        setSelectedProvider(provider);

        // Parse API binding to get capability
        try {
          const apiBinding = typeof bundle.api_binding === 'string'
            ? JSON.parse(bundle.api_binding)
            : bundle.api_binding;

          if (apiBinding && apiBinding.product_type) {
            setSelectedCapability(apiBinding.product_type);
          }
        } catch (error) {
          console.error('Error parsing API binding:', error);
        }
      }
    }
  }, [bundle.id, bundle.api_provider_id, bundle.api_provider_bundle_id, bundle.api_binding, providers]);

  const handleUnsetProvider = () => {
    setBundle({
      ...bundle,
      api_provider_id: null,
      api_provider_bundle_id: null,
      api_binding: null
    });
    setSelectedProvider(null);
    setSelectedCapability('');
    setSelectedProviderBundle(null);
  };

  const buildApiBindingObject = () => {
    if (!selectedProviderBundle) return null;

    return {
      api_provider_id: selectedProvider?.id,
      api_provider_bundle_id: selectedProviderBundle.id?.toString() || selectedProviderBundle.id?.toString(),
      api_binding: {
        product_type: selectedCapability,
        operator: selectedProviderBundle.operator,
        internet_type: selectedProviderBundle.internet_type,
        sim_type: selectedProviderBundle.sim_type,
        product_id: selectedProviderBundle.id || selectedProviderBundle.id,
        table_id: selectedProviderBundle.table_id,
        name: selectedProviderBundle.name,
        days: selectedProviderBundle.days,
        volume: selectedProviderBundle.volume,
        unit: selectedProviderBundle.unit,
        periodicity: selectedProviderBundle.periodicity,
        amount: selectedProviderBundle.amount,
        amount_rial: selectedProviderBundle.amount_rial
      }
    };
  };

  const companyDialogFooter = (
    <>
      <Button label={t('APP.GENERAL.CANCEL')} icon="pi pi-times" severity="danger" className={isRTL() ? 'rtl-button' : ''} onClick={onHide} />
      <Button label={t('FORM.GENERAL.SUBMIT')} icon="pi pi-check" severity="success" className={isRTL() ? 'rtl-button' : ''} onClick={onSave} />
    </>
  );

  const apiBinding = buildApiBindingObject();
  console.log('API Binding Object:', apiBinding);

  return (
    <Dialog
      visible={visible}
      style={{ width: '900px', padding: '5px' }}
      header={t('BUNDLE.DETAILS')}
      modal
      className="p-fluid"
      footer={companyDialogFooter}
      onHide={onHide}
    >
      <div className="card" style={{ padding: '40px' }}>
        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.BUNDLETITLE')}
            </label>
            <InputText
              id="bundle_title"
              value={bundle.bundle_title}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  bundle_title: e.target.value
                })
              }
              required
              autoFocus
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUNDLETITLE')}
              className={classNames({
                'p-invalid': submitted && !bundle.bundle_title
              })}
            />
            {submitted && !bundle.bundle_title && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>

          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.BUNDLEDESCRIPTION')}
            </label>
            <InputText
              id="bundle_description"
              value={bundle.bundle_description}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  bundle_description: e.target.value
                })
              }
              required
              autoFocus
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUNDLEDESCRIPTION')}
              className={classNames({
                'p-invalid': submitted && !bundle.bundle_description
              })}
            />
            {submitted && !bundle.bundle_description && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.ADMINBUYINGPRICE')}
            </label>
            <InputText
              id="admin_buying_price"
              value={bundle.admin_buying_price}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  admin_buying_price: e.target.value
                })
              }
              required
              autoFocus
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.ADMINBUYINGPRICE')}
              className={classNames({
                'p-invalid': submitted && !bundle.admin_buying_price
              })}
            />
            {submitted && !bundle.admin_buying_price && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>

          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.BUYINGPRICE')}
            </label>
            <InputText
              id="buying_price"
              value={bundle.buying_price}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  buying_price: e.target.value
                })
              }
              required
              autoFocus
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUYINGPRICE')}
              className={classNames({
                'p-invalid': submitted && !bundle.buying_price
              })}
            />
            {submitted && !bundle.buying_price && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.SELLINGPRICE')}
            </label>
            <InputText
              id="selling_price"
              value={bundle.selling_price}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  selling_price: e.target.value
                })
              }
              required
              autoFocus
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.SELLINGPRICE')}
              className={classNames({
                'p-invalid': submitted && !bundle.selling_price
              })}
            />
            {submitted && !bundle.selling_price && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>
          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.VALIDITYTYPE')}
            </label>
            <Dropdown
              id="validity_type"
              value={bundle.validity_type}
              options={[
                { label: 'Unlimited', value: 'unlimited' },
                { label: 'Daily', value: 'daily' },
                { label: 'Nightly', value: 'nightly' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' }
              ]}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  validity_type: e.value
                })
              }
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.VALIDITYTYPE')}
              className="w-full"
            />
            {submitted && !bundle.validity_type && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.SERVICENAME')}
            </label>
            <Dropdown
              id="service"
              value={services.find((s: Service) => s.id === bundle.service_id) || null}
              options={services}
              onChange={(e) => {
                setBundle({
                  ...bundle,
                  service_id: e.value.id,
                  service: e.value
                });
              }}
              optionLabel="company.company_name"
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.SERVICENAME')}
              className="w-full"
              itemTemplate={(option) => (
                <div style={{ display: 'flex', gap: '5px' }}>
                  <div>{option.service_category?.category_name}</div>
                  <div>- {option.company?.company_name}</div>
                </div>
              )}
              valueTemplate={(option) => {
                if (!option) return t('BUNDLE.FORM.PLACEHOLDER.SERVICENAME');
                return (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <div>{option.service_category?.category_name}</div>
                    <div>- {option.company?.company_name}</div>
                  </div>
                );
              }}
            />
            {submitted && !bundle.service_id && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>

          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.CURRENCY')}
            </label>
            <Dropdown
              id="currency"
              value={bundle.currency}
              options={currencies}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  currency: e.value
                })
              }
              optionLabel="name"
              placeholder={t('CURRENCY.GENERAL.SELECTCURRENCY')}
              className="w-full"
            />
            {submitted && !bundle.currency && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>
        </div>

        <div className="formgrid grid">
          <div className="field col">
            <label htmlFor="bundleTypeFilter" style={{ fontWeight: 'bold' }}>
              {t('ORDER.FILTER.BUNDLE_TYPE')}
            </label>
            <Dropdown
              id="bundleTypeFilter"
              options={[
                { label: t('BUNDLE.FORM.INPUT.SELECT.BUNDLETYPE.OPTION.CREDIT'), value: 'credit' },
                { label: t('BUNDLE.FORM.INPUT.SELECT.BUNDLETYPE.OPTION.PACKAGE'), value: 'package' }
              ]}
              value={bundle.bundle_type}
              onChange={(e) => setBundle({ ...bundle, bundle_type: e.value })}
              placeholder={t('ORDER.FILTER.SELECT_TYPE')}
              style={{ width: '100%' }}
            />
            {submitted && !bundle.bundle_type && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>

          <div className="field col">
            <label htmlFor="name" style={{ fontWeight: 'bold' }}>
              {t('BUNDLE.FORM.INPUT.AMOUNT')}
            </label>
            <InputText
              id="amount"
              value={bundle.amount?.toString()}
              onChange={(e) =>
                setBundle({
                  ...bundle,
                  amount: e.target.value
                })
              }
              required
              autoFocus
              placeholder={t('BUNDLE.FORM.PLACEHOLDER.AMOUNT')}
              className={classNames({
                'p-invalid': submitted && !bundle.amount
              })}
            />
            {submitted && bundle.bundle_type === 'credit' && !bundle.amount && (
              <small className="p-invalid" style={{ color: 'red' }}>
                {t('THIS_FIELD_IS_REQUIRED')}
              </small>
            )}
          </div>
        </div>

        {/* Provider Section */}
        <div className="formgrid grid">
          <div className="field col-12">
            <div className="flex align-items-center justify-content-between mb-3">
              <label htmlFor="provider" style={{ fontWeight: 'bold', margin: 0 }}>
                {t('BUNDLE_PROVIDER')}
              </label>
              {bundle.api_provider_id && (
                <Button
                  label={t('UNSET_PROVIDER')}
                  icon="pi pi-times"
                  severity="danger"
                  className="p-button-sm"
                  onClick={handleUnsetProvider}
                />
              )}
            </div>

            <div className="grid">
              <div className="field col">
                <Dropdown
                  id="provider"
                  value={selectedProvider}
                  options={providers}
                  onChange={(e) => {
                    setSelectedProvider(e.value);
                  }}
                  optionLabel="name"
                  filter
                  filterBy="name"
                  filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                  showFilterClear
                  placeholder={t('SEARCH_PROVIDER')}
                  className="w-full"
                  panelClassName="min-w-[20rem]"
                  onFilter={(e) => {
                    setProviderSearchTag(e.filter);
                  }}
                  disabled={!!bundle.api_provider_id}
                />
              </div>

              <div className="field col">
                <Dropdown
                  id="capability"
                  value={selectedCapability}
                  options={selectedProvider?.capabilities || []}
                  onChange={(e) => {
                    setSelectedCapability(e.value);
                  }}
                  placeholder={t('SEARCH_CAPABILITIES')}
                  className="w-full"
                  panelClassName="min-w-[20rem]"
                  disabled={!!bundle.api_provider_id || !selectedProvider}
                />
              </div>
            </div>
          </div>
        </div>

        {selectedProvider && selectedCapability && (
          <div className="formgrid grid">
            <div className="field col-12">
              <label htmlFor="providerBundle" style={{ fontWeight: 'bold' }}>
                {t('BUNDLE')} *
              </label>
              <Dropdown
                id="providerBundle"
                value={selectedProviderBundle}
                options={rawInternets}
                onChange={(e) => {
                  setSelectedProviderBundle(e.value);
                }}
                optionLabel="name"
                filter
                filterBy="name"
                filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                showFilterClear
                placeholder={t('SEARCH_BUNDLE')}
                className="w-full"
                panelClassName="min-w-[20rem]"
                itemTemplate={(option) => (
                  <div className="flex flex-col p-2 gap-2 item-center">
                    <div className="font-semibold text-sm">{option.name}</div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{option.operator}</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                        {option.volume} {option.unit}
                      </span>
                      {option.days && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">{option.days}</span>}
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">{option.periodicity}</span>
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                        {option.amount_rial ? `${option.amount_rial} Rial` : `${option.amount}`}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {option.internet_type} | {option.sim_type}
                    </div>
                  </div>
                )}
                valueTemplate={(option) => {
                  if (!option) return t('SEARCH_BUNDLE');
                  return (
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{option.name}</span>
                      <span className="text-xs text-gray-600">
                        {option.volume} {option.unit} | {option.amount_rial ? `${option.amount_rial} Rial` : `${option.amount}`}
                      </span>
                    </div>
                  );
                }}
                disabled={!!bundle.api_provider_id}
              />
            </div>
          </div>
        )}

        {/* API Binding Preview */}
        {apiBinding && (
          <div className="formgrid grid mt-3">
            <div className="field col-12">
              <div className="p-card" style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                <h5 style={{ marginBottom: '0.5rem', color: '#495057' }}>API Binding Preview:</h5>
                <pre style={{ fontSize: '0.8rem', color: '#6c757d', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(apiBinding, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default BundleDialog;
