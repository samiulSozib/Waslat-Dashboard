/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import { Bundle, Provider, RawInternet, Service } from '@/types/interface';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../utilities/rtlUtil';
import { _fetchProviders } from '@/app/redux/actions/providerActions';
import { _fetchSingleProvider } from '@/app/redux/actions/singleProviderAction';
import { _addBundle, _editBundle, _setProvider, _unsetProvider } from '@/app/redux/actions/bundleActions';

interface BundleFormProps {
  visible: boolean;
  onHide: () => void;
  bundle?: Bundle | null;
  onSubmitSuccess?: () => void;
  services: any[];
  currencies: any[];
  providers: any[];
}

const BundleForm: React.FC<BundleFormProps> = ({
  visible,
  onHide,
  bundle,
  onSubmitSuccess,
  services,
  currencies,
  providers: initialProviders
}) => {
  const emptyBundle: Bundle = {
    id: 0,
    bundle_code: '',
    service_id: 0,
    bundle_title: '',
    bundle_description: '',
    bundle_type: '',
    validity_type: '',
    admin_buying_price: '',
    buying_price: '',
    selling_price: '',
    amount: '',
    bundle_image_url: '',
    currency_id: 0,
    expired_date: '',
    deleted_at: '',
    created_at: '',
    updated_at: '',
    service: null,
    currency: null,
    api_provider_id: null,
    api_provider_bundle_id: null,
    api_binding: null
  };

  const [formData, setFormData] = useState<Bundle>(emptyBundle);
  const [submitted, setSubmitted] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedCapability, setSelectedCapability] = useState('');
  const [selectedProviderBundle, setSelectedProviderBundle] = useState<RawInternet | null>(null);
  const [providerSearchTag, setProviderSearchTag] = useState('');
  const [providers, setProviders] = useState(initialProviders);

  const toast = useRef<Toast>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();
  const { rawInternets } = useSelector((state: any) => state.singleProviderReducer);

  useEffect(() => {
    if (bundle) {
      setFormData(bundle);
      
      // Parse and set provider data if exists
      if (bundle.api_provider_id && bundle.api_binding) {
        let parsedApiBinding: any = null;
        try {
          parsedApiBinding = typeof bundle.api_binding === 'string' ? JSON.parse(bundle.api_binding) : bundle.api_binding;
        } catch (e) {
          console.error('Failed to parse api_binding:', e);
        }

        if (parsedApiBinding) {
          const provider = providers.find((p: any) => p.id == bundle.api_provider_id);
          if (provider) {
            setSelectedProvider(provider);
            const capability = provider.capabilities.find((cap: any) => 
              cap.toLowerCase().includes(parsedApiBinding.internet_type) || 
              cap.toLowerCase().includes(parsedApiBinding.sim_type)
            ) || provider.capabilities[0];
            setSelectedCapability(capability);

            const providerBundle = rawInternets.find((b: any) => 
              String(b.table_id) === String(parsedApiBinding.table_id) && 
              String(b.id) === String(parsedApiBinding.product_id)
            );
            setSelectedProviderBundle(providerBundle || parsedApiBinding);
          }
        }
      }
    } else {
      setFormData(emptyBundle);
      resetProviderData();
    }
  }, [bundle, visible]);

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

  const resetProviderData = () => {
    setSelectedProvider(null);
    setSelectedCapability('');
    setSelectedProviderBundle(null);
    setProviderSearchTag('');
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceChange = (service: Service) => {
    setFormData(prev => ({
      ...prev,
      service_id: service.id,
      service: service
    }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    
    // Validation
    if (!formData.bundle_title || !formData.bundle_description || !formData.admin_buying_price || 
        !formData.buying_price || !formData.selling_price || !formData.validity_type || 
        !formData.service || !formData.currency) {
      toast.current?.show({
        severity: 'error',
        summary: t('VALIDATION_ERROR'),
        detail: t('PLEASE_FILLED_ALL_REQUIRED_FIELDS'),
        life: 3000
      });
      return;
    }

    try {
      let result;
      if (formData.id && formData.id !== 0) {
        result = await dispatch(_editBundle(formData.id, formData, toast, t));
      } else {
        result = await dispatch(_addBundle(formData, toast, t));
      }

      // Set provider if selected
      if (result && selectedProvider && selectedProviderBundle) {
        const providerData = {
          api_provider_id: selectedProvider.id,
          api_provider_bundle_id: selectedProviderBundle.id,
          api_binding: {
            product_type: selectedProviderBundle.product_type,
            operator: selectedProviderBundle.operator,
            internet_type: selectedProviderBundle.internet_type,
            sim_type: selectedProviderBundle.sim_type,
            product_id: selectedProviderBundle.id,
            table_id: selectedProviderBundle.table_id,
            name: selectedProviderBundle.name,
            days: selectedProviderBundle.days,
            volume: selectedProviderBundle.volume,
            unit: selectedProviderBundle.unit,
            periodicity: selectedProviderBundle.periodicity
          }
        };
        await dispatch(_setProvider(result.id, providerData, toast, t));
      }

      handleClose();
      if (onSubmitSuccess) onSubmitSuccess();
      
    } catch (error) {
      console.error('Bundle operation failed:', error);
    }
  };

  const handleClose = () => {
    setFormData(emptyBundle);
    setSubmitted(false);
    resetProviderData();
    onHide();
  };

  const footer = (
    <>
      <Button 
        label={t('APP.GENERAL.CANCEL')} 
        icon="pi pi-times" 
        severity="danger" 
        className={isRTL() ? 'rtl-button' : ''} 
        onClick={handleClose} 
      />
      <Button 
        label={t('FORM.GENERAL.SUBMIT')} 
        icon="pi pi-check" 
        severity="success" 
        className={isRTL() ? 'rtl-button' : ''} 
        onClick={handleSubmit} 
      />
    </>
  );

  return (
    <>
      <Toast ref={toast} />
      <Dialog 
        visible={visible} 
        style={{ width: '900px', padding: '5px' }} 
        header={t('BUNDLE.DETAILS')} 
        modal 
        className="p-fluid" 
        footer={footer} 
        onHide={handleClose}
      >
        <div className="card" style={{ padding: '40px' }}>
          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="name" style={{ fontWeight: 'bold' }}>
                {t('BUNDLE.FORM.INPUT.BUNDLETITLE')}
              </label>
              <InputText
                id="bundle_title"
                value={formData.bundle_title}
                onChange={(e) => handleInputChange('bundle_title', e.target.value)}
                required
                autoFocus
                placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUNDLETITLE')}
                className={classNames({
                  'p-invalid': submitted && !formData.bundle_title
                })}
              />
              {submitted && !formData.bundle_title && (
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
                value={formData.bundle_description}
                onChange={(e) => handleInputChange('bundle_description', e.target.value)}
                required
                placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUNDLEDESCRIPTION')}
                className={classNames({
                  'p-invalid': submitted && !formData.bundle_description
                })}
              />
              {submitted && !formData.bundle_description && (
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
                value={formData.admin_buying_price}
                onChange={(e) => handleInputChange('admin_buying_price', e.target.value)}
                required
                placeholder={t('BUNDLE.FORM.PLACEHOLDER.ADMINBUYINGPRICE')}
                className={classNames({
                  'p-invalid': submitted && !formData.admin_buying_price
                })}
              />
              {submitted && !formData.admin_buying_price && (
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
                value={formData.buying_price}
                onChange={(e) => handleInputChange('buying_price', e.target.value)}
                required
                placeholder={t('BUNDLE.FORM.PLACEHOLDER.BUYINGPRICE')}
                className={classNames({
                  'p-invalid': submitted && !formData.buying_price
                })}
              />
              {submitted && !formData.buying_price && (
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
                value={formData.selling_price}
                onChange={(e) => handleInputChange('selling_price', e.target.value)}
                required
                placeholder={t('BUNDLE.FORM.PLACEHOLDER.SELLINGPRICE')}
                className={classNames({
                  'p-invalid': submitted && !formData.selling_price
                })}
              />
              {submitted && !formData.selling_price && (
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
                value={formData.validity_type}
                options={[
                  { label: 'Unlimited', value: 'unlimited' },
                  { label: 'Daily', value: 'daily' },
                  { label: 'Nightly', value: 'nightly' },
                  { label: 'Weekly', value: 'weekly' },
                  { label: 'Monthly', value: 'monthly' },
                  { label: 'Yearly', value: 'yearly' }
                ]}
                onChange={(e) => handleInputChange('validity_type', e.value)}
                placeholder={t('BUNDLE.FORM.PLACEHOLDER.VALIDITYTYPE')}
                className="w-full"
              />
              {submitted && !formData.validity_type && (
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
                value={services.find((s: Service) => s.id === formData.service_id) || null}
                options={services}
                onChange={(e) => handleServiceChange(e.value)}
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
              {submitted && !formData.service_id && (
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
                value={formData.currency}
                options={currencies}
                onChange={(e) => handleInputChange('currency', e.value)}
                optionLabel="name"
                placeholder={t('CURRENCY.GENERAL.SELECTCURRENCY')}
                className="w-full"
              />
              {submitted && !formData.currency && (
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
                value={formData.bundle_type}
                onChange={(e) => handleInputChange('bundle_type', e.value)}
                placeholder={t('ORDER.FILTER.SELECT_TYPE')}
                style={{ width: '100%' }}
              />
              {submitted && !formData.bundle_type && (
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
                value={formData.amount?.toString()}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder={t('BUNDLE.FORM.PLACEHOLDER.AMOUNT')}
                className={classNames({
                  'p-invalid': submitted && formData.bundle_type === 'credit' && !formData.amount
                })}
              />
              {submitted && formData.bundle_type === 'credit' && !formData.amount && (
                <small className="p-invalid" style={{ color: 'red' }}>
                  {t('THIS_FIELD_IS_REQUIRED')}
                </small>
              )}
            </div>
          </div>

          {/* Provider Selection Section */}
          <div className="formgrid grid">
            <div className="field col">
              <label htmlFor="provider">{t('BUNDLE_PROVIDER')} *</label>
              <Dropdown
                id="provider"
                value={selectedProvider}
                options={providers}
                onChange={(e) => setSelectedProvider(e.value)}
                optionLabel="name"
                filter
                filterBy="name"
                filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                showFilterClear
                placeholder={t('SEARCH_PROVIDER')}
                className="w-full"
                panelClassName="min-w-[20rem]"
                onFilter={(e) => setProviderSearchTag(e.filter)}
              />
            </div>

            <div className="field col">
              <label htmlFor="reseller">{t('CAPABILITIES')} *</label>
              <Dropdown
                id="reseller"
                value={selectedCapability}
                options={selectedProvider?.capabilities}
                onChange={(e) => setSelectedCapability(e.value)}
                placeholder={t('SEARCH_CAPABILITIES')}
                className="w-full"
                panelClassName="min-w-[20rem]"
                disabled={!selectedProvider}
              />
            </div>
          </div>

          <div className="formgrid grid">
            <div className="field col-12">
              <label htmlFor="provider">{t('BUNDLE')} *</label>
              <Dropdown
                id="provider"
                value={selectedProviderBundle}
                options={rawInternets}
                onChange={(e) => setSelectedProviderBundle(e.value)}
                optionLabel="name"
                filter
                filterBy="name"
                filterPlaceholder={t('ECOMMERCE.COMMON.SEARCH')}
                showFilterClear
                placeholder={t('SEARCH_PROVIDER')}
                className="w-full"
                panelClassName="min-w-[20rem]"
                disabled={!selectedProvider || !selectedCapability}
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
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded">{option.amount_rial ? `${option.amount_rial}` : `${option.amount}`}</span>
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
                        {option.volume} {option.unit} <span className="mx-2"> | </span> {option.amount_rial ? `${option.amount_rial}` : `${option.amount}`}{' '}
                      </span>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default BundleForm;