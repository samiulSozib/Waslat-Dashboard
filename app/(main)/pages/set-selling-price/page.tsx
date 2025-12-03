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
import { RadioButton } from 'primereact/radiobutton';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { AppDispatch } from '@/app/redux/store';
import { useTranslation } from 'react-i18next';
import withAuth from '../../authGuard';
import { _blukbundlePriceUpdate } from '@/app/redux/actions/bundleActions';
import { MultiSelect } from 'primereact/multiselect';
import { _fetchServiceList } from '@/app/redux/actions/serviceActions';
import { Service } from '@/types/interface';

interface BulkBundlePriceForm {
    adjustment_type: 'percentage' | 'fixed';
    adjustment_value: number;
    adjustment_direction: 'increase' | 'decrease';
    base_price: 'admin_buying_price' | 'buying_price' | 'selling_price';
    service_ids: number[];
    confirmation: boolean;
}

const BulkBundlePriceUpdatePage = () => {
    const [formData, setFormData] = useState<BulkBundlePriceForm>({
        adjustment_type: 'percentage',
        adjustment_value: 10,
        adjustment_direction: 'increase',
        base_price: 'selling_price',
        service_ids: [],
        confirmation: false
    });

    const [submitted, setSubmitted] = useState(false);
    const toast = useRef<Toast>(null);
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation();

    const { bulkUpdate } = useSelector((state: any) => state.bundleReducer);
    const { services, loading } = useSelector((state: any) => state.serviceReducer);

    useEffect(() => {
        dispatch(_fetchServiceList());
    }, [dispatch]);

    const serviceOptions = services.map((service: Service) => ({
            label: `${service.service_category?.category_name} - ${service.company?.company_name}`,
            value: service.id
        }));


    const isUpdateLoading = bulkUpdate.loading;

    const handleInputChange = (field: keyof BulkBundlePriceForm, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        setSubmitted(true);

        if (!formData.adjustment_value || formData.adjustment_value <= 0) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PLEASE_ENTER_VALID_ADJUSTMENT_VALUE'),
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

        if (formData.adjustment_type === 'percentage' && formData.adjustment_value > 1000) {
            toast.current?.show({
                severity: 'error',
                summary: t('VALIDATION_ERROR'),
                detail: t('PERCENTAGE_VALUE_TOO_HIGH'),
                life: 3000
            });
            return;
        }

        const payload = {
            adjustment_type: formData.adjustment_type,
            adjustment_value: formData.adjustment_value,
            base_price: formData.base_price,
            adjustment_direction: formData.adjustment_direction,
            confirmation: formData.confirmation,
            service_ids:formData.service_ids
        };

        await dispatch(_blukbundlePriceUpdate(payload, toast, t));

        if (!bulkUpdate.error) {
            handleReset();
        }
    };

    const adjustmentTypeOptions = [
        { label: t('PERCENTAGE'), value: 'percentage' },
        { label: t('FIXED_AMOUNT'), value: 'fixed' }
    ];

    const basePriceOptions = [
        { label: t('ADMIN_BUYING_PRICE'), value: 'admin_buying_price' },
        { label: t('CURRENT_BUYING_PRICE'), value: 'buying_price' },
        { label: t('CURRENT_SELLING_PRICE'), value: 'selling_price' }
    ];

    const getCalculationDescription = () => {
        const base = formData.base_price === 'admin_buying_price'
            ? t('ADMIN_BUYING_PRICE')
            : formData.base_price === 'buying_price'
                ? t('CURRENT_BUYING_PRICE')
                : t('CURRENT_SELLING_PRICE');

        const value = formData.adjustment_value;
        const direction = formData.adjustment_direction === 'increase' ? t('INCREASE') : t('DECREASE');

        if (formData.adjustment_type === 'percentage') {
            return direction === t('INCREASE')
                ? t('INCREASE_BY_PERCENTAGE_FROM_BASE', { percentage: value, base })
                : t('DECREASE_BY_PERCENTAGE_FROM_BASE', { percentage: value, base });
        } else {
            return direction === t('INCREASE')
                ? t('ADD_FIXED_AMOUNT_TO_BASE', { amount: value, base })
                : t('SUBTRACT_FIXED_AMOUNT_FROM_BASE', { amount: value, base });
        }
    };

    const handleReset = () => {
        setFormData({
            adjustment_type: 'percentage',
            adjustment_value: 10,
            adjustment_direction: 'increase',
            base_price: 'selling_price',
            confirmation: false,
            service_ids: [],
        });
        setSubmitted(false);
    };

        

    return (
        <div className="grid -m-5">
            <div className="col-12">
                <div className="card p-2 md:p-4">
                    <Toast ref={toast} />

                    <div className="flex justify-content-between align-items-center mb-3">
                        <h3 className="m-0 text-lg md:text-xl">{t('BULK_BUNDLE_PRICE_UPDATE')}</h3>
                    </div>

                    <Divider className="my-2" />

                    <Card className="shadow-1 p-2 md:p-3">
                        <div className="p-fluid grid">
                            {/* Base Price */}
                            <div className="field col-12 md:col-6">
                                <label htmlFor="base_price" className="font-semibold text-sm">
                                    {t('BASE_PRICE_FOR_CALCULATION')} *
                                </label>
                                <Dropdown
                                    id="base_price"
                                    value={formData.base_price}
                                    options={basePriceOptions}
                                    onChange={(e) => handleInputChange('base_price', e.value)}
                                    placeholder={t('SELECT_BASE_PRICE')}
                                    className="w-full text-sm"
                                />
                                <small className="p-text-secondary text-xs">
                                    {t('BASE_PRICE_HELP_TEXT')}
                                </small>
                            </div>

                            {/* Adjustment Type */}
                            <div className="field col-12 md:col-6">
                                <label htmlFor="adjustment_type" className="font-semibold text-sm">
                                    {t('ADJUSTMENT_TYPE')} *
                                </label>
                                <Dropdown
                                    id="adjustment_type"
                                    value={formData.adjustment_type}
                                    options={adjustmentTypeOptions}
                                    onChange={(e) => handleInputChange('adjustment_type', e.value)}
                                    placeholder={t('SELECT_ADJUSTMENT_TYPE')}
                                    className="w-full text-sm"
                                />
                            </div>

                            

                            {/* Adjustment Value */}
                            <div className="field col-12 md:col-6 mt-2">
                                <label htmlFor="adjustment_value" className="font-semibold text-sm">
                                    {formData.adjustment_type === 'percentage'
                                        ? t('ADJUSTMENT_PERCENTAGE')
                                        : t('ADJUSTMENT_AMOUNT')} *
                                </label>
                                <InputNumber
                                    id="adjustment_value"
                                    value={formData.adjustment_value}
                                    onValueChange={(e) => handleInputChange('adjustment_value', e.value)}
                                    mode="decimal"
                                    min={0}
                                    max={formData.adjustment_type === 'percentage' ? 1000 : undefined}
                                    suffix={formData.adjustment_type === 'percentage' ? '%' : ''}
                                    placeholder={
                                        formData.adjustment_type === 'percentage'
                                            ? t('ENTER_PERCENTAGE')
                                            : t('ENTER_AMOUNT')
                                    }
                                    className="w-full text-sm"
                                    inputClassName="p-inputtext-sm"
                                />
                                {submitted && (!formData.adjustment_value || formData.adjustment_value <= 0) && (
                                    <small className="text-red-500 text-xs">
                                        {t('PLEASE_ENTER_VALID_VALUE')}
                                    </small>
                                )}
                            </div>

                            {/* Services Selection */}
                            <div className="field col-12 md:col-6 mt-2">
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

                            {/* Adjustment Direction */}
                            <div className="field col-12 mt-2">
                                <label className="font-semibold text-sm block mb-1">
                                    {t('ADJUSTMENT_DIRECTION')} *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <div className="flex align-items-center">
                                        <RadioButton
                                            inputId="increase"
                                            name="direction"
                                            value="increase"
                                            checked={formData.adjustment_direction === 'increase'}
                                            onChange={(e) => handleInputChange('adjustment_direction', e.value)}
                                            className="mr-1"
                                        />
                                        <label htmlFor="increase" className="text-sm ml-1">
                                            {t('INCREASE_PRICE')}
                                        </label>
                                    </div>
                                    <div className="flex align-items-center">
                                        <RadioButton
                                            inputId="decrease"
                                            name="direction"
                                            value="decrease"
                                            checked={formData.adjustment_direction === 'decrease'}
                                            onChange={(e) => handleInputChange('adjustment_direction', e.value)}
                                            className="mr-1"
                                        />
                                        <label htmlFor="decrease" className="text-sm ml-1">
                                            {t('DECREASE_PRICE')}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Calculation Preview */}
                            <div className="field col-12 mt-3">
                                <div className="p-2 border-round bg-blue-50">
                                    <h5 className="mt-0 mb-1 text-sm font-semibold">{t('CALCULATION_PREVIEW')}</h5>
                                    <p className="m-0 text-blue-800 text-xs">
                                        {getCalculationDescription()}
                                    </p>
                                    <p className="m-0 mt-1 text-gray-600 text-xs">
                                        {t('THIS_WILL_AFFECT_ALL_BUNDLES')}
                                    </p>
                                </div>
                            </div>

                            {/* Important Notes */}
                            <div className="field col-12 mt-2">
                                <div className="p-2 border-round surface-ground">
                                    <h6 className="mt-0 mb-1 text-red-600 text-sm">
                                        <i className="pi pi-exclamation-triangle mr-1"></i>
                                        {t('IMPORTANT_NOTES')}
                                    </h6>
                                    <ul className="m-0 pl-3 text-xs">
                                        <li>{t('BULK_UPDATE_IRREVERSIBLE')}</li>
                                        <li>{t('ALL_BUNDLES_AFFECTED')}</li>
                                        <li>{t('RECOMMEND_PREVIEW_FIRST')}</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Confirmation */}
                            <div className="field col-12 mt-2">
                                <div className="flex align-items-center">
                                    <Checkbox
                                        inputId="confirmation"
                                        checked={formData.confirmation}
                                        onChange={(e) => handleInputChange('confirmation', e.checked)}
                                        className={submitted && !formData.confirmation ? 'p-invalid mr-1' : 'mr-1'}
                                    />
                                    <label htmlFor="confirmation" className="text-sm font-semibold ml-1">
                                        {t('I_CONFIRM_BULK_PRICE_UPDATE')}
                                    </label>
                                </div>
                                {submitted && !formData.confirmation && (
                                    <small className="text-red-500 text-xs">
                                        {t('CONFIRMATION_REQUIRED')}
                                    </small>
                                )}
                            </div>

                            {/* Loading */}
                            {isUpdateLoading && (
                                <div className="field col-12 mt-2">
                                    <div className="flex align-items-center gap-2 p-2 border-round surface-ground">
                                        <ProgressBar mode="indeterminate" style={{ height: '3px', flex: 1 }} />
                                        <span className="text-xs">{t('UPDATING_PRICES')}...</span>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="field col-12 flex gap-2 justify-content-end mt-3">
                                <Button
                                    label={t('RESET')}
                                    icon="pi pi-times"
                                    severity="secondary"
                                    onClick={handleReset}
                                    disabled={isUpdateLoading}
                                    outlined
                                    size="small"
                                    className="text-xs"
                                />

                                <Button
                                    label={isUpdateLoading ? t('UPDATING') : t('UPDATE_ALL_PRICES')}
                                    icon={isUpdateLoading ? 'pi pi-spinner pi-spin' : 'pi pi-check'}
                                    severity="danger"
                                    onClick={handleSubmit}
                                    loading={isUpdateLoading}
                                    disabled={isUpdateLoading || !formData.confirmation}
                                    size="small"
                                    className="text-xs"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Results */}
                    {bulkUpdate.result && (
                        <Card className="shadow-1 mt-3 border-green-200 p-2">
                            <div className="p-2">
                                <h5 className="mt-0 mb-2 text-green-700 text-sm">
                                    <i className="pi pi-check-circle mr-1"></i>
                                    {t('UPDATE_SUMMARY')}
                                </h5>
                                <div className="grid">
                                    <div className="col-12 md:col-6">
                                        <p className="m-0 text-xs">
                                            <strong>{t('TOTAL_BUNDLES_UPDATED')}:</strong>{' '}
                                            <span className="text-green-600">
                                                {bulkUpdate.result.updated_bundles?.length || bulkUpdate.result.total_updated || 0}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-12 md:col-6">
                                        <p className="m-0 text-xs">
                                            <strong>{t('UPDATED_AT')}:</strong>{' '}
                                            <span>{new Date().toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default withAuth(BulkBundlePriceUpdatePage);