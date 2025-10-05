/* eslint-disable @next/next/no-img-element */
'use client';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { ProgressBar } from 'primereact/progressbar';
import { Checkbox } from 'primereact/checkbox';
import { MultiSelect } from 'primereact/multiselect';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import { useTranslation } from 'react-i18next';
import withAuth from '../../authGuard';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { Service } from '@/types/interface';
import { _bundlePriceAdjustmentUpdate } from '@/app/redux/actions/bundleActions';

interface PriceAdjustmentForm {
    adjustment_type: 'percentage' | 'fixed';
    adjustment_value: number;
    base_price: 'admin_buying_price' | 'buying_price';
    service_ids: number[];
    confirmation: boolean;
}

const BundlePricingPage = () => {
    const [formData, setFormData] = useState<PriceAdjustmentForm>({
        adjustment_type: 'percentage',
        adjustment_value: 10,
        base_price: 'admin_buying_price',
        service_ids: [],
        confirmation: false
    });

    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();
    const { services, loading } = useSelector((state: any) => state.serviceReducer);
    const { priceAdjustment } = useSelector((state: any) => state.bundleReducer);

    const isUpdateLoading = priceAdjustment.updateLoading;

    useEffect(() => {
        dispatch(_fetchServiceList());
    }, [dispatch]);

    const handleInputChange = (field: keyof PriceAdjustmentForm, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        setSubmitted(true);

        if (!formData.adjustment_value) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_ENTER_ADJUSTMENT_VALUE'),
                life: 3000
            });
            return;
        }

        if (!formData.confirmation) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_CONFIRM_UPDATE'),
                life: 3000
            });
            return;
        }

        if (formData.adjustment_type === 'percentage' && Math.abs(formData.adjustment_value) > 1000) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PERCENTAGE_VALUE_TOO_HIGH'),
                life: 3000
            });
            return;
        }

        // Dispatch update action
        await dispatch(_bundlePriceAdjustmentUpdate(formData, toast, t));

        // Reset form on success
        if (!priceAdjustment.updateError) {
            setFormData({
                adjustment_type: 'percentage',
                adjustment_value: 10,
                base_price: 'admin_buying_price',
                service_ids: [],
                confirmation: false
            });
            setSubmitted(false);
        }
    };

    const adjustmentTypeOptions = [
        { label: t('PERCENTAGE'), value: 'percentage' },
        { label: t('FIXED_AMOUNT'), value: 'fixed' }
    ];

    const basePriceOptions = [
        { label: t('ADMIN_BUYING_PRICE'), value: 'admin_buying_price' },
        { label: t('CURRENT_BUYING_PRICE'), value: 'buying_price' }
    ];

    const serviceOptions = services.map((service: Service) => ({
        label: `${service.service_category?.category_name} - ${service.company?.company_name}`,
        value: service.id
    }));

    const getCalculationDescription = () => {
        const base = formData.base_price === 'admin_buying_price' ? t('ADMIN_BUYING_PRICE') : t('CURRENT_BUYING_PRICE');
        const value = formData.adjustment_value;

        if (formData.adjustment_type === 'percentage') {
            return value >= 0
                ? t('INCREASE_BY_PERCENTAGE_FROM_BASE', { percentage: value, base })
                : t('DECREASE_BY_PERCENTAGE_FROM_BASE', { percentage: Math.abs(value), base });
        } else {
            return value >= 0
                ? t('ADD_FIXED_AMOUNT_TO_BASE', { amount: value, base })
                : t('SUBTRACT_FIXED_AMOUNT_FROM_BASE', { amount: Math.abs(value), base });
        }
    };

    const handleReset = () => {
        setFormData({
            adjustment_type: 'percentage',
            adjustment_value: 10,
            base_price: 'admin_buying_price',
            service_ids: [],
            confirmation: false
        });
        setSubmitted(false);
    };

    return (
        <div className="grid -m-5">
            <div className="col-12">
                <div className="card p-4">
                    {loading && <ProgressBar mode="indeterminate" style={{ height: '6px' }} />}
                    <Toast ref={toast} />

                    <div className="flex justify-content-between align-items-center mb-4">
                        <h2 className="m-0">{t('BUNDLE_PRICING_ADJUSTMENT')}</h2>
                    </div>

                    <Divider />

                    <Card className="shadow-2">
                        <div className="p-fluid grid">
                            {/* Adjustment Type */}
                            <div className="field col-12 md:col-6">
                                <label htmlFor="adjustment_type" style={{ fontWeight: 'bold' }}>
                                    {t('ADJUSTMENT_TYPE')} *
                                </label>
                                <Dropdown
                                    id="adjustment_type"
                                    value={formData.adjustment_type}
                                    options={adjustmentTypeOptions}
                                    onChange={(e) => handleInputChange('adjustment_type', e.value)}
                                    placeholder={t('SELECT_ADJUSTMENT_TYPE')}
                                    className="w-full"
                                />
                                {submitted && !formData.adjustment_type && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            {/* Adjustment Value */}
                            <div className="field col-12 md:col-6">
                                <label htmlFor="adjustment_value" style={{ fontWeight: 'bold' }}>
                                    {formData.adjustment_type === 'percentage' ? t('ADJUSTMENT_PERCENTAGE') : t('ADJUSTMENT_AMOUNT')} *
                                </label>
                                <InputNumber
                                    id="adjustment_value"
                                    value={formData.adjustment_value}
                                    onValueChange={(e) => handleInputChange('adjustment_value', e.value)}
                                    mode="decimal"
                                    min={formData.adjustment_type === 'percentage' ? -1000 : undefined}
                                    max={formData.adjustment_type === 'percentage' ? 1000 : undefined}
                                    suffix={formData.adjustment_type === 'percentage' ? '%' : ''}
                                    placeholder={formData.adjustment_type === 'percentage' ? t('ENTER_PERCENTAGE') : t('ENTER_AMOUNT')}
                                    className="w-full"
                                />
                                {submitted && !formData.adjustment_value && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('THIS_FIELD_IS_REQUIRED')}
                                    </small>
                                )}
                                {formData.adjustment_type === 'percentage' && Math.abs(formData.adjustment_value) > 1000 && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('PERCENTAGE_RANGE_ERROR')}
                                    </small>
                                )}
                            </div>

                            {/* Base Price */}
                            <div className="field col-12 md:col-6">
                                <label htmlFor="base_price" style={{ fontWeight: 'bold' }}>
                                    {t('BASE_PRICE')}
                                </label>
                                <Dropdown
                                    id="base_price"
                                    value={formData.base_price}
                                    options={basePriceOptions}
                                    onChange={(e) => handleInputChange('base_price', e.value)}
                                    placeholder={t('SELECT_BASE_PRICE')}
                                    className="w-full"
                                />
                                <small className="p-text-secondary">
                                    {t('DEFAULT_BASE_PRICE_HELP')}
                                </small>
                            </div>

                            {/* Services Selection */}
                            <div className="field col-12 md:col-6">
                                <label htmlFor="service_ids" style={{ fontWeight: 'bold' }}>
                                    {t('SPECIFIC_SERVICES')}
                                </label>
                                <MultiSelect
                                    id="service_ids"
                                    value={formData.service_ids}
                                    options={serviceOptions}
                                    onChange={(e) => handleInputChange('service_ids', e.value)}
                                    placeholder={t('SELECT_SERVICES_OPTIONAL')}
                                    className="w-full"
                                    display="chip"
                                    filter
                                    showSelectAll={false}
                                />
                                <small className="p-text-secondary">
                                    {t('ALL_SERVICES_IF_EMPTY')}
                                </small>
                            </div>

                            {/* Calculation Description */}
                            <div className="field col-12">
                                <div className="p-3 border-round bg-blue-50">
                                    <h4 className="mt-0 mb-2">{t('CALCULATION_DESCRIPTION')}</h4>
                                    <p className="m-0 text-blue-800">
                                        {getCalculationDescription()}
                                    </p>
                                    {formData.service_ids.length > 0 && (
                                        <p className="m-0 mt-2 text-blue-600">
                                            {t('APPLIED_TO_SELECTED_SERVICES', { count: formData.service_ids.length })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Confirmation Checkbox */}
                            <div className="field col-12">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="confirmation"
                                        checked={formData.confirmation}
                                        onChange={(e) => handleInputChange('confirmation', e.checked)}
                                    />
                                    <label htmlFor="confirmation" className="ml-2" style={{ fontWeight: 'bold', color: 'var(--red-500)' }}>
                                        {t('CONFIRM_PRICE_UPDATE')}
                                    </label>
                                </div>
                                {submitted && !formData.confirmation && (
                                    <small className="p-invalid" style={{ color: 'red' }}>
                                        {t('CONFIRMATION_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="field col-12 flex gap-3 justify-content-end mt-4">
                                <Button
                                    label={t('RESET')}
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={handleReset}
                                    disabled={isUpdateLoading}
                                />

                                <Button
                                    label={t('UPDATE_PRICES')}
                                    icon="pi pi-check"
                                    severity="success"
                                    onClick={handleSubmit}
                                    loading={isUpdateLoading}
                                    disabled={isUpdateLoading || !formData.confirmation}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Examples Section */}
                    <Card className="shadow-1 mt-4">
                        <h3 className="mt-0">{t('EXAMPLES')}</h3>
                        <Divider />
                        
                        <div className="grid">
                            <div className="col-12 md:col-6">
                                <h4>{t('COMMON_SCENARIOS')}</h4>
                                <ul className="list-none p-0 m-0">
                                    <li className="mb-2">• {t('ADD_10_PERCENT_MARGIN')}</li>
                                    <li className="mb-2">• {t('INCREASE_CURRENT_PRICES_5_PERCENT')}</li>
                                    <li className="mb-2">• {t('ADD_FIXED_AMOUNT_EXAMPLE')}</li>
                                    <li className="mb-2">• {t('SPECIFIC_SERVICES_EXAMPLE')}</li>
                                </ul>
                            </div>
                            
                            <div className="col-12 md:col-6">
                                <h4>{t('NOTES')}</h4>
                                <ul className="list-none p-0 m-0">
                                    <li className="mb-2">• {t('CONFIRMATION_REQUIRED_NOTE')}</li>
                                    <li className="mb-2">• {t('PRICES_CANNOT_GO_BELOW_ADMIN')}</li>
                                    <li className="mb-2">• {t('CHANGES_ARE_PERMANENT')}</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default withAuth(BundlePricingPage);